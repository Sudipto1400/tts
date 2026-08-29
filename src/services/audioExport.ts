import { AudioFormat } from '../types';

export function generateDefaultFilename(voiceId: string, format: AudioFormat = 'mp3'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = String(Math.floor(Math.random() * 90 + 10));

  return `BanglaVoice_${voiceId}_${year}-${month}-${day}_${randomSuffix}.${format}`;
}

export function downloadAudioBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after trigger
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function downloadAudioFromUrl(audioUrl: string, filename: string): Promise<void> {
  try {
    if (audioUrl.startsWith('data:')) {
      // Data URL to blob
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      downloadAudioBlob(blob, filename);
    } else if (audioUrl.startsWith('blob:')) {
      const anchor = document.createElement('a');
      anchor.href = audioUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
      }, 500);
    } else {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      downloadAudioBlob(blob, filename);
    }
  } catch (err) {
    console.error('Download error:', err);
    // Fallback direct link
    const anchor = document.createElement('a');
    anchor.href = audioUrl;
    anchor.download = filename;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
    }, 500);
  }
}
