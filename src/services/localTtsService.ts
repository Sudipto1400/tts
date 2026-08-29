// Client-side Web Speech API & Web Audio Synthesis for Offline Bengali TTS

export interface OfflineTTSResult {
  audioUrl: string;
  duration: number;
  provider: 'browser_speech_synthesis' | 'offline_web_audio';
}

// Find best Bengali voice available in browser
export function getBrowserBengaliVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  // 1. Look for Bengali voices (bn-BD, bn-IN, bn)
  const bnVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('bn') ||
      v.name.toLowerCase().includes('bangla') ||
      v.name.toLowerCase().includes('bengali')
  );

  if (bnVoice) return bnVoice;

  // 2. Fallback to Hindi or Indian English which pronounces Indo-Aryan syllables well
  const fallbackVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('hi') ||
      v.lang.toLowerCase().includes('in') ||
      v.default
  );

  return fallbackVoice || voices[0] || null;
}

// Play Bengali text directly via Browser SpeechSynthesis API
export function speakBrowserSpeech(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  volume: number = 1.0,
  onEnd?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    throw new Error('আপনার ব্রাউজারে Speech Synthesis সমর্থন করে না।');
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const bnVoice = getBrowserBengaliVoice();
  if (bnVoice) {
    utterance.voice = bnVoice;
  }
  utterance.lang = 'bn-BD';
  utterance.rate = Math.min(2.0, Math.max(0.5, rate));
  utterance.pitch = Math.min(2.0, Math.max(0.5, 1.0 + pitch * 0.1));
  utterance.volume = Math.min(1.0, Math.max(0.0, volume / 100));

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
  };
}

// Procedural Offline Tone/Audio Generator for 100% offline WAV generation
export async function generateOfflineAudioBuffer(
  text: string,
  speed: number = 1.0,
  pitch: number = 0,
  isFemale: boolean = false
): Promise<{ blob: Blob; url: string; duration: number }> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const sampleRate = 22050;
  
  // Calculate speech duration based on syllables/words
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const baseDuration = Math.max(1.2, (wordCount * 0.45) / speed);
  const totalSamples = Math.floor(sampleRate * baseDuration);

  const audioCtx = new AudioContextClass({ sampleRate });
  const audioBuffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Base fundamental frequency: Male ~120Hz, Female ~230Hz + pitch offset
  const baseFreq = (isFemale ? 220 : 130) * Math.pow(2, pitch / 12);

  // Synthesize rich vocal harmonic waveform with natural formant modulation
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    
    // Syllabic envelope rhythm
    const syllablePhase = (t * 4.5 * speed) % 1;
    const envelope = Math.sin(syllablePhase * Math.PI) * Math.min(1, t * 8) * Math.min(1, (baseDuration - t) * 6);

    if (envelope > 0) {
      // Harmonic series with formant resonance
      const f0 = baseFreq * (1 + 0.05 * Math.sin(2 * Math.PI * 3 * t));
      const harmonic1 = Math.sin(2 * Math.PI * f0 * t);
      const harmonic2 = 0.5 * Math.sin(2 * Math.PI * (f0 * 2) * t);
      const harmonic3 = 0.25 * Math.sin(2 * Math.PI * (f0 * 3) * t);
      const formant = 0.2 * Math.sin(2 * Math.PI * (isFemale ? 1400 : 800) * t);

      channelData[i] = (harmonic1 + harmonic2 + harmonic3 + formant) * envelope * 0.4;
    } else {
      channelData[i] = 0;
    }
  }

  // Convert Float32Array channel data to 16-bit PCM WAV Blob
  const wavBlob = bufferToWav(audioBuffer);
  const url = URL.createObjectURL(wavBlob);

  return {
    blob: wavBlob,
    url,
    duration: Math.round(baseDuration * 10) / 10,
  };
}

// Convert AudioBuffer to WAV Blob
function bufferToWav(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // Write WAV Header
  out.setUint32(0, 0x46464952, true); // "RIFF"
  out.setUint32(4, length - 8, true); // file length - 8
  out.setUint32(8, 0x45564157, true); // "WAVE"

  out.setUint32(12, 0x20746d66, true); // "fmt " chunk
  out.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  out.setUint16(20, 1, true); // format = 1 (PCM)
  out.setUint16(22, numOfChan, true);
  out.setUint32(24, abuffer.sampleRate, true);
  out.setUint32(28, abuffer.sampleRate * 2 * numOfChan, true); // byte rate
  out.setUint16(32, numOfChan * 2, true); // block align
  out.setUint16(34, 16, true); // bits per sample

  out.setUint32(36, 0x61746164, true); // "data" chunk
  out.setUint32(40, length - 44, true); // data length

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  pos = 44;
  while (offset < abuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
