export type Gender = 'male' | 'female';

export type VoiceStyle = 
  | 'natural'
  | 'deep'
  | 'calm'
  | 'emotional'
  | 'story'
  | 'news'
  | 'professional'
  | 'inspirational'
  | 'documentary'
  | 'educational'
  | 'ad'
  | 'poetry'
  | 'podcast'
  | 'casual'
  | 'energetic'
  | 'spiritual'
  | 'authoritative'
  | 'warm'
  | 'cheerful';

export type TTSProvider = 'gemini_ai' | 'google_tts' | 'browser_local';

export type AudioFormat = 'mp3' | 'wav';

export interface VoiceProfile {
  id: string; // e.g. M01, M02, ..., F01, F02, ...
  name: string; // Bengali name e.g. "রাকিব - গভীর পুরুষ কণ্ঠ"
  gender: Gender;
  style: VoiceStyle;
  styleBn: string; // e.g. "গভীর", "শান্ত", "সংবাদ"
  description: string; // Detailed Bengali description
  provider: TTSProvider;
  voiceModel: string; // Model name / voice mapping
  language: string; // "bn-BD" or "bn-IN"
  sampleText: string; // Bengali sample sentence for preview
  tags: string[]; // Filter tags
  isOfflineAvailable: boolean;
  speedDefault: number;
  pitchDefault: number;
  isFavorite?: boolean;
}

export interface AudioSettings {
  speed: number; // 0.5 to 2.0
  pitch: number; // -4 to +4 or 0.8 to 1.2
  volume: number; // 0 to 100
  format: AudioFormat;
  quality: 'standard' | 'high';
}

export interface GeneratedAudioItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  gender?: Gender;
  styleBn?: string;
  audioBlob?: Blob;
  audioUrl: string;
  duration: number; // in seconds
  format: AudioFormat;
  createdAt: number; // timestamp
  settings: AudioSettings;
  isOfflineGenerated?: boolean;
  provider?: string;
}

export interface Preset {
  id: string;
  name: string;
  iconName: string;
  description: string;
  recommendedVoiceId: string;
  speed: number;
  pitch: number;
  volume: number;
  samplePrompt: string;
  category: string;
}

export interface TTSGenerationRequest {
  text: string;
  voiceId: string;
  speed: number;
  pitch: number;
  volume: number;
  format: AudioFormat;
  quality?: 'standard' | 'high';
}

export interface TTSGenerationResponse {
  success: boolean;
  audioBase64?: string;
  audioUrl?: string;
  mimeType: string;
  duration?: number;
  providerUsed: string;
  isFallback?: boolean;
  error?: string;
}
