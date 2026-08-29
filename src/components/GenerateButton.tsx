import React from 'react';
import { Volume2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  progressStep: string;
  disabled: boolean;
  isOnline: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onGenerate,
  isGenerating,
  progressStep,
  disabled,
  isOnline,
}) => {
  return (
    <div className="w-full">
      <button
        id="main-generate-audio-btn"
        type="button"
        disabled={disabled || isGenerating}
        onClick={onGenerate}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
          disabled
            ? 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800'
            : isGenerating
            ? 'bg-indigo-700 text-white cursor-wait shadow-[0_0_20px_rgba(99,102,241,0.4)]'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 active:scale-[0.98] text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.6)] border border-indigo-400/30'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span>{progressStep || 'অডিও তৈরি হচ্ছে...'}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            <span>অডিও তৈরি করুন (Generate Audio)</span>
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse hidden sm:inline" />
          </>
        )}
      </button>

      {!isOnline && (
        <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-xs text-amber-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>আপনি অফলাইনে আছেন — লোকাল সিন্থেসাইজার মোডে অডিও তৈরি হবে।</span>
        </div>
      )}
    </div>
  );
};

