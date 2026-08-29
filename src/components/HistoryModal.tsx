import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Play, 
  Download, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { formatDateBengali, formatTimeBengali, toBengaliNumber } from '../utils/bengaliUtils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: GeneratedAudioItem[];
  onPlayItem: (item: GeneratedAudioItem) => void;
  onDownloadItem: (item: GeneratedAudioItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  currentPlayingId?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyItems,
  onPlayItem,
  onDownloadItem,
  onDeleteItem,
  onClearAll,
  currentPlayingId,
}) => {
  if (!isOpen) return null;

  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>তৈরি করা অডিওর ইতিহাস</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {toBengaliNumber(historyItems.length)}টি সংরক্ষিত
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার ব্রাউজারে অফলাইনে সংরক্ষিত
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

        {/* Clear all confirmation banner */}
        {confirmClear && (
          <div className="p-3.5 bg-rose-950/40 border-b border-rose-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>আপনি কি নিশ্চিত যে সব সংরক্ষিত অডিও মুছে ফেলতে চান?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
              >
                না
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xs"
              >
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        )}

        {/* List of items */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {historyItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <History className="w-12 h-12 mx-auto text-slate-600 mb-3 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">
                এখনও কোনো অডিও তৈরি করা হয়নি
              </p>
              <p className="text-xs text-slate-500 mt-1">
                আপনার তৈরি করা অডিওগুলো এখানে অফলাইনে সংরক্ষণ করা থাকবে
              </p>
            </div>
          ) : (
            historyItems.map((item) => {
              const isPlaying = currentPlayingId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPlaying
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.voiceId}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {item.voiceName}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.format.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDateBengali(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3 font-light">
                    {item.text}
                  </p>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      দৈর্ঘ্য: {formatTimeBengali(item.duration)}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Play / Load in Player button */}
                      <button
                        type="button"
                        onClick={() => {
                          onPlayItem(item);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>শুনুন</span>
                      </button>

                      {/* Download button */}
                      <button
                        type="button"
                        onClick={() => onDownloadItem(item)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          {historyItems.length > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সব মুছে ফেলুন</span>
            </button>
          )}

          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

