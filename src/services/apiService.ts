import { TTSGenerationRequest, TTSGenerationResponse } from '../types';

export async function requestAudioGeneration(params: TTSGenerationRequest): Promise<TTSGenerationResponse> {
  const response = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `সার্ভার ত্রুটি: ${response.status}`);
  }

  return response.json();
}

export async function requestVoicePreview(voiceId: string, sampleText: string): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
  const response = await fetch('/api/tts/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voiceId, sampleText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'নমুনা অডিও লোড করা যায়নি');
  }

  return response.json();
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
