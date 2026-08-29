import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lazy GoogleGenAI client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Convert 16-bit PCM Buffer to standard WAV Buffer
function pcmToWav(pcmData: Buffer, sampleRate: number = 24000, numChannels: number = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const wavHeader = Buffer.alloc(44);

  // RIFF identifier
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + pcmData.length, 4);
  wavHeader.write('WAVE', 8);

  // fmt sub-chunk
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(pcmData.length, 40);

  return Buffer.concat([wavHeader, pcmData]);
}

// Clean and chunk Bengali text safely
function sanitizeAndChunkText(text: string, maxChunkLength: number = 180): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Clean special markup like SSML tags if any or extra spaces
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return [];

  // Split by Bengali sentence terminators: দাঁড়ি (।), ?, !, newline
  const sentenceDelimiters = /([।?!;\n]+)/g;
  const rawParts = clean.split(sentenceDelimiters);
  const sentences: string[] = [];

  for (let i = 0; i < rawParts.length; i += 2) {
    const sentence = rawParts[i] || '';
    const delimiter = rawParts[i + 1] || '';
    const full = (sentence + delimiter).trim();
    if (full) {
      sentences.push(full);
    }
  }

  // Combine small sentences into chunks up to maxChunkLength
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (sentence.length > maxChunkLength) {
      // Break large sentences by commas or spaces
      const subParts = sentence.split(/([,፣،\s]+)/);
      for (const sp of subParts) {
        if ((currentChunk + sp).length > maxChunkLength && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sp;
        } else {
          currentChunk += sp;
        }
      }
    } else if ((currentChunk + ' ' + sentence).length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [clean.slice(0, maxChunkLength)];
}

// Fetch Google Bengali TTS audio for a text segment
async function fetchGoogleTTSAudio(text: string, lang: string = 'bn'): Promise<Buffer> {
  const encodedText = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`Google TTS request failed: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'বাংলা Text-to-Audio ইঞ্জিন সক্রিয় রয়েছে।',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Main TTS Generation Endpoint
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voiceId = 'M01', speed = 1.0, pitch = 0, format = 'mp3' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে কিছু বাংলা লেখা প্রদান করুন।',
      });
    }

    const cleanText = text.trim();
    const chunks = sanitizeAndChunkText(cleanText);

    // Map voice ID to underlying model/tone
    const isMale = voiceId.startsWith('M');
    const geminiVoice = isMale 
      ? (voiceId === 'M01' || voiceId === 'M09' || voiceId === 'M32' ? 'Fenrir' : voiceId === 'M03' || voiceId === 'M15' ? 'Puck' : 'Charon')
      : (voiceId === 'F03' || voiceId === 'F27' ? 'Puck' : 'Kore');

    const ai = getGeminiClient();
    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/mp3';
    let providerUsed = 'google_tts';

    // Attempt Gemini AI TTS first if API key is available
    if (ai && chunks.length <= 4 && cleanText.length < 500) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: `Read following Bengali text naturally with high clarity: ${cleanText}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: geminiVoice },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const rawPcm = Buffer.from(base64Audio, 'base64');
          audioBuffer = pcmToWav(rawPcm, 24000, 1);
          mimeType = 'audio/wav';
          providerUsed = 'gemini_ai';
        }
      } catch (geminiErr: any) {
        console.warn('Gemini TTS fallback triggered:', geminiErr?.message || geminiErr);
      }
    }

    // High quality Bengali Google TTS stream fallback / primary reliable engine
    if (!audioBuffer) {
      const audioBuffers: Buffer[] = [];
      const lang = (voiceId.startsWith('M07') || voiceId.startsWith('F15') || voiceId.startsWith('M28') || voiceId.startsWith('F22')) ? 'bn' : 'bn';

      for (const chunk of chunks) {
        try {
          const buf = await fetchGoogleTTSAudio(chunk, lang);
          if (buf && buf.length > 0) {
            audioBuffers.push(buf);
          }
        } catch (e) {
          console.error('Error fetching chunk TTS:', e);
        }
      }

      if (audioBuffers.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'দুঃখিত, অডিও তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।',
        });
      }

      audioBuffer = Buffer.concat(audioBuffers);
      mimeType = 'audio/mp3';
      providerUsed = 'neural_google_tts';
    }

    const base64Output = audioBuffer.toString('base64');
    const estimatedDuration = Math.max(1, Math.round(cleanText.split(/\s+/).length / (2.5 * speed)));

    return res.json({
      success: true,
      audioBase64: `data:${mimeType};base64,${base64Output}`,
      mimeType,
      duration: estimatedDuration,
      providerUsed,
      format,
    });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: 'অডিও তৈরি করতে সমস্যা হয়েছে। ' + (error?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'),
    });
  }
});

// Voice Preview Endpoint
app.post('/api/tts/preview', async (req, res) => {
  try {
    const { voiceId = 'M01', sampleText = 'বাংলা টেক্সট টু অডিও অ্যাপ্লিকেশনে আপনাকে স্বাগতম।' } = req.body;
    const cleanSample = (sampleText || 'বাংলা টেক্সট টু অডিও অ্যাপ্লিকেশনে আপনাকে স্বাগতম।').trim();

    try {
      const audioBuf = await fetchGoogleTTSAudio(cleanSample, 'bn');
      const base64Output = audioBuf.toString('base64');
      return res.json({
        success: true,
        audioBase64: `data:audio/mp3;base64,${base64Output}`,
        voiceId,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'নমুনা অডিও লোড করা সম্ভব হয়নি।',
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'প্রিভিউ অডিও তৈরি করতে ব্যর্থ হয়েছে।',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`বাংলা Text-to-Audio সার্ভার চালু হয়েছে: http://0.0.0.0:${PORT}`);
  });
}

startServer();
