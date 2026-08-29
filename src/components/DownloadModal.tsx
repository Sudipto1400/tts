import React, { useState } from 'react';
import { X, Download, FileAudio, Check } from 'lucide-react';
import { GeneratedAudioItem, AudioFormat } from '../types';
import { downloadAudioFromUrl, generateDefaultFilename } from '../services/audioExport';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GeneratedAudioItem | null;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!isOpen || !item) return null;

  const [filename, setFilename] = useState(() => {
    return generateDefaultFilename(item.voiceId, item.format);
  });
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>(item.format || 'mp3');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let finalName = filename.trim();
      if (!finalName.endsWith(`.${selectedFormat}`)) {
        finalName = finalName.replace(/\.[^/.]+$/, '') + `.${selectedFormat}`;
      }
      await downloadAudioFromUrl(item.audioUrl, finalName);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 sm:p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                অডিও ডাউনলোড করুন
              </h3>
              <p className="text-xs text-slate-400">
                পছন্দের ফরম্যাট ও নামে সেভ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4">
          {/* Filename input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ফাইলের নাম (Filename):
            </label>
            <input
              id="download-filename-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
            />
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              অডিও ফরম্যাট নির্বাচন:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('mp3');
                  setFilename((prev) => prev.replace(/\.wav$/i, '.mp3'));
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedFormat === 'mp3'
                    ? 'bg-slate-900 border-indigo-500 text-white ring-1 ring-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileAudio className="w-4 h-4 text-indigo-400" />
                <span>MP3 (প্রস্তাবিত)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('wav');
                  setFilename((prev) => prev.replace(/\.mp3$/i, '.wav'));
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedFormat === 'wav'
                    ? 'bg-slate-900 border-indigo-500 text-white ring-1 ring-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileAudio className="w-4 h-4 text-cyan-400" />
                <span>WAV (HQ Raw)</span>
              </button>
            </div>
          </div>

          {/* Voice details summary */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-1.5 font-light">
            <div className="flex justify-between">
              <span>কণ্ঠ:</span>
              <span className="font-semibold text-slate-200">
                {item.voiceName} ({item.voiceId})
              </span>
            </div>
            <div className="flex justify-between">
              <span>গতি ও পিচ:</span>
              <span className="font-mono text-slate-300">{item.settings.speed}x / {item.settings.pitch >= 0 ? `+${item.settings.pitch}` : item.settings.pitch}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            বাতিল
          </button>

          <button
            id="download-confirm-btn"
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/30 transition-all active:scale-95"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>ডাউনলোড সম্পন্ন!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'সেভ করুন'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

