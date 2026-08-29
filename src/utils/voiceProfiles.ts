export interface VoiceAcousticConfig {
  voiceId: string;
  gender: 'male' | 'female';
  pitchSemitones: number; // Semitone shift: -7 to +7
  bassDb: number;        // Low shelf boost/cut at 160Hz
  midDb: number;         // Peaking filter at 1800Hz
  trebleDb: number;      // High shelf boost/cut at 4500Hz
  highPassCutoff?: number; // Cut muddy low end (< 90Hz)
  tempoMultiplier: number;
  geminiVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Kore' | 'Aoede' | 'Leda' | 'Callisto' | 'Orus' | 'Thalassa';
  stylePrompt: string;
}

// 100 Individual Voice Custom Acoustic Profiles
export function getVoiceAcousticConfig(voiceId: string): VoiceAcousticConfig {
  const isMale = voiceId.startsWith('M');
  const num = parseInt(voiceId.replace(/\D/g, ''), 10) || 1;

  if (isMale) {
    // Male Voice Profiles (M01 - M50)
    switch (voiceId) {
      case 'M01': // Rakib - Deep Cinematic
        return {
          voiceId: 'M01',
          gender: 'male',
          pitchSemitones: -4.8,
          bassDb: 6.5,
          midDb: -1.0,
          trebleDb: -2.5,
          tempoMultiplier: 0.94,
          geminiVoice: 'Fenrir',
          stylePrompt: 'Speak in a deep, booming cinematic baritone Bengali voice with dramatic weight.',
        };
      case 'M02': // Tanvir - Natural Conversation
        return {
          voiceId: 'M02',
          gender: 'male',
          pitchSemitones: -2.0,
          bassDb: 2.0,
          midDb: 1.0,
          trebleDb: 0.5,
          tempoMultiplier: 1.0,
          geminiVoice: 'Zephyr',
          stylePrompt: 'Speak in a natural, clear, conversational Bengali male voice.',
        };
      case 'M03': // Shakib - Energetic Youth
        return {
          voiceId: 'M03',
          gender: 'male',
          pitchSemitones: -0.2,
          bassDb: -1.0,
          midDb: 2.5,
          trebleDb: 3.0,
          tempoMultiplier: 1.08,
          geminiVoice: 'Puck',
          stylePrompt: 'Speak in an energetic, youthful, upbeat Bengali male voice.',
        };
      case 'M04': // Anisur Rahman - Authoritative Elder
        return {
          voiceId: 'M04',
          gender: 'male',
          pitchSemitones: -3.8,
          bassDb: 5.0,
          midDb: 0.5,
          trebleDb: -1.5,
          tempoMultiplier: 0.92,
          geminiVoice: 'Charon',
          stylePrompt: 'Speak in a mature, wise, authoritative Bengali male voice with calm dignity.',
        };
      case 'M05': // Farhan - Casual Friendly
        return {
          voiceId: 'M05',
          gender: 'male',
          pitchSemitones: -1.5,
          bassDb: 1.5,
          midDb: 1.0,
          trebleDb: 1.0,
          tempoMultiplier: 1.02,
          geminiVoice: 'Zephyr',
          stylePrompt: 'Speak in a warm, friendly, approachable Bengali male voice.',
        };
      case 'M06': // Imran Khan - News Reader
        return {
          voiceId: 'M06',
          gender: 'male',
          pitchSemitones: -1.2,
          bassDb: 2.0,
          midDb: 4.0,
          trebleDb: 3.5,
          tempoMultiplier: 1.07,
          geminiVoice: 'Orus',
          stylePrompt: 'Speak in a formal, crisp, authoritative Bengali national newsreader tone.',
        };
      case 'M07': // Soumen Chakraborty - Storyteller Kolkata
        return {
          voiceId: 'M07',
          gender: 'male',
          pitchSemitones: -3.0,
          bassDb: 3.5,
          midDb: 2.0,
          trebleDb: 0.0,
          tempoMultiplier: 0.95,
          geminiVoice: 'Charon',
          stylePrompt: 'Speak in an expressive, atmospheric Bengali storyteller voice with narrative pauses.',
        };
      case 'M08': // Tahmid - Motivational Speaker
        return {
          voiceId: 'M08',
          gender: 'male',
          pitchSemitones: -1.0,
          bassDb: 3.0,
          midDb: 3.5,
          trebleDb: 2.0,
          tempoMultiplier: 1.05,
          geminiVoice: 'Fenrir',
          stylePrompt: 'Speak in an inspiring, bold, motivational Bengali speech tone.',
        };
      case 'M09': // Kaysar Ahmed - Ultra Deep Bass
        return {
          voiceId: 'M09',
          gender: 'male',
          pitchSemitones: -5.8,
          bassDb: 7.5,
          midDb: -1.5,
          trebleDb: -3.0,
          tempoMultiplier: 0.89,
          geminiVoice: 'Fenrir',
          stylePrompt: 'Speak in an ultra-deep, gravelly, heavy sub-bass Bengali male voice.',
        };
      case 'M10': // Nadim - Calm Meditation
        return {
          voiceId: 'M10',
          gender: 'male',
          pitchSemitones: -2.8,
          bassDb: 2.5,
          midDb: -2.0,
          trebleDb: -1.0,
          tempoMultiplier: 0.86,
          geminiVoice: 'Zephyr',
          stylePrompt: 'Speak in a soothing, soft, relaxing meditation guide voice in Bengali.',
        };
      case 'M15': // Rifat - High-Energy Promo / Ad
        return {
          voiceId: 'M15',
          gender: 'male',
          pitchSemitones: +0.6,
          bassDb: 0.0,
          midDb: 4.5,
          trebleDb: 4.0,
          tempoMultiplier: 1.15,
          geminiVoice: 'Puck',
          stylePrompt: 'Speak in a fast, punchy, persuasive commercial ad voice in Bengali.',
        };
      case 'M16': // Tarek - Radio Jockey RJ
        return {
          voiceId: 'M16',
          gender: 'male',
          pitchSemitones: -0.8,
          bassDb: 3.5,
          midDb: 3.0,
          trebleDb: 3.0,
          tempoMultiplier: 1.1,
          geminiVoice: 'Puck',
          stylePrompt: 'Speak in a vibrant, engaging Bengali FM radio jockey style.',
        };
      default: {
        // Algorithmic distinct profile for M11-M50
        const seed = (num * 17) % 31;
        const pitchShift = -5.0 + (seed / 31) * 4.5; // range: -5.0 to -0.5 semitones
        const bassVal = 1.0 + ((num * 7) % 6);       // range: 1.0 to 6.0 dB
        const midVal = -1.0 + ((num * 11) % 5);      // range: -1.0 to 3.0 dB
        const trebleVal = -2.0 + ((num * 13) % 5);   // range: -2.0 to 2.0 dB
        const tempo = 0.92 + ((num * 3) % 20) * 0.01; // range: 0.92 to 1.11

        const maleModels: Array<'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Orus'> = [
          'Fenrir', 'Charon', 'Puck', 'Zephyr', 'Orus'
        ];
        const chosenModel = maleModels[num % maleModels.length];

        return {
          voiceId,
          gender: 'male',
          pitchSemitones: Math.round(pitchShift * 10) / 10,
          bassDb: bassVal,
          midDb: midVal,
          trebleDb: trebleVal,
          tempoMultiplier: Math.round(tempo * 100) / 100,
          geminiVoice: chosenModel,
          stylePrompt: `Speak in a distinct Bengali male voice (${voiceId}) with clear articulation.`,
        };
      }
    }
  } else {
    // Female Voice Profiles (F01 - F50)
    switch (voiceId) {
      case 'F01': // Shreya - Clear Melodic
        return {
          voiceId: 'F01',
          gender: 'female',
          pitchSemitones: +2.4,
          bassDb: -2.0,
          midDb: 1.5,
          trebleDb: 3.5,
          highPassCutoff: 120,
          tempoMultiplier: 1.0,
          geminiVoice: 'Kore',
          stylePrompt: 'Speak in a clear, melodic, bright Bengali female voice.',
        };
      case 'F02': // Nusrat Jahan - Natural Conversation
        return {
          voiceId: 'F02',
          gender: 'female',
          pitchSemitones: +1.6,
          bassDb: -1.0,
          midDb: 1.0,
          trebleDb: 2.0,
          highPassCutoff: 110,
          tempoMultiplier: 1.0,
          geminiVoice: 'Aoede',
          stylePrompt: 'Speak in a natural, warm, conversational Bengali female voice.',
        };
      case 'F03': // Priyoti - Energetic Young Girl
        return {
          voiceId: 'F03',
          gender: 'female',
          pitchSemitones: +4.2,
          bassDb: -3.0,
          midDb: 2.5,
          trebleDb: 4.5,
          highPassCutoff: 140,
          tempoMultiplier: 1.08,
          geminiVoice: 'Puck',
          stylePrompt: 'Speak in an energetic, cheerful, bright young Bengali female voice.',
        };
      case 'F04': // Dr. Rasheda - Warm Corporate Presenter
        return {
          voiceId: 'F04',
          gender: 'female',
          pitchSemitones: +1.0,
          bassDb: 0.5,
          midDb: 2.0,
          trebleDb: 1.5,
          highPassCutoff: 100,
          tempoMultiplier: 0.97,
          geminiVoice: 'Aoede',
          stylePrompt: 'Speak in an educated, articulate, professional corporate Bengali female voice.',
        };
      case 'F05': // Samira - Friendly Casual
        return {
          voiceId: 'F05',
          gender: 'female',
          pitchSemitones: +2.0,
          bassDb: -1.5,
          midDb: 1.0,
          trebleDb: 2.5,
          highPassCutoff: 110,
          tempoMultiplier: 1.02,
          geminiVoice: 'Kore',
          stylePrompt: 'Speak in a friendly, gentle, everyday casual Bengali female tone.',
        };
      case 'F06': // Mahbuba - News Reader
        return {
          voiceId: 'F06',
          gender: 'female',
          pitchSemitones: +1.8,
          bassDb: -0.5,
          midDb: 4.0,
          trebleDb: 3.5,
          highPassCutoff: 120,
          tempoMultiplier: 1.08,
          geminiVoice: 'Callisto',
          stylePrompt: 'Speak in a formal, authoritative, broadcast Bengali female newsreader tone.',
        };
      case 'F07': // Snigdha - Soft Whisper / Sleep Story
        return {
          voiceId: 'F07',
          gender: 'female',
          pitchSemitones: +3.0,
          bassDb: -2.0,
          midDb: -1.5,
          trebleDb: 4.0,
          highPassCutoff: 130,
          tempoMultiplier: 0.87,
          geminiVoice: 'Leda',
          stylePrompt: 'Speak in a soft, whispering, gentle, serene bedtime story voice in Bengali.',
        };
      case 'F12': // RJ Tina - Radio Jockey
        return {
          voiceId: 'F12',
          gender: 'female',
          pitchSemitones: +3.2,
          bassDb: -1.0,
          midDb: 3.5,
          trebleDb: 4.0,
          highPassCutoff: 120,
          tempoMultiplier: 1.12,
          geminiVoice: 'Thalassa',
          stylePrompt: 'Speak in a bubbly, entertaining, lively Bengali radio host style.',
        };
      case 'F25': // Maitreyi - Audio Book Narrator
        return {
          voiceId: 'F25',
          gender: 'female',
          pitchSemitones: +1.5,
          bassDb: 0.0,
          midDb: 2.0,
          trebleDb: 2.0,
          highPassCutoff: 105,
          tempoMultiplier: 0.93,
          geminiVoice: 'Aoede',
          stylePrompt: 'Speak in an expressive, nuanced, literary Bengali audiobook narrator voice.',
        };
      default: {
        // Algorithmic distinct profile for F08-F50
        const seed = (num * 19) % 37;
        const pitchShift = +1.0 + (seed / 37) * 4.5; // range: +1.0 to +5.5 semitones
        const bassVal = -3.5 + ((num * 5) % 4);       // range: -3.5 to -0.5 dB
        const midVal = 0.0 + ((num * 7) % 5);        // range: 0.0 to 4.0 dB
        const trebleVal = 1.5 + ((num * 11) % 5);    // range: 1.5 to 5.5 dB
        const tempo = 0.94 + ((num * 5) % 18) * 0.01; // range: 0.94 to 1.11

        const femaleModels: Array<'Kore' | 'Aoede' | 'Leda' | 'Callisto' | 'Thalassa'> = [
          'Kore', 'Aoede', 'Leda', 'Callisto', 'Thalassa'
        ];
        const chosenModel = femaleModels[num % femaleModels.length];

        return {
          voiceId,
          gender: 'female',
          pitchSemitones: Math.round(pitchShift * 10) / 10,
          bassDb: bassVal,
          midDb: midVal,
          trebleDb: trebleVal,
          highPassCutoff: 115,
          tempoMultiplier: Math.round(tempo * 100) / 100,
          geminiVoice: chosenModel,
          stylePrompt: `Speak in a distinct Bengali female voice (${voiceId}) with clean clarity.`,
        };
      }
    }
  }
}
