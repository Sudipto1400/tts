import React from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Feather, 
  Newspaper, 
  Video, 
  Share2, 
  Smartphone, 
  GraduationCap, 
  Compass, 
  Megaphone, 
  Smile, 
  ArrowRight 
} from 'lucide-react';
import { BANGLA_PRESETS } from '../data/presets';
import { Preset } from '../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: Preset) => void;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  BookOpen,
  Feather,
  Newspaper,
  Video,
  Share2,
  Smartphone,
  GraduationCap,
  Compass,
  Megaphone,
  Sparkles,
  Smile,
};

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                রেডি-মেড বাংলা প্রিসেটসমূহ (১১টি ক্যাটাগরি)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                যেকোনো প্রিসেট নির্বাচন করলে উপযুক্ত ভয়েস, স্পিড ও নমুনা লেখা স্বয়ংক্রিয়ভাবে লোড হবে
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

        {/* Presets Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {BANGLA_PRESETS.map((preset) => {
            const IconComponent = ICON_MAP[preset.iconName] || Sparkles;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="group p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/70 bg-slate-950/70 hover:bg-slate-900/90 shadow-xs hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-light">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 group-hover:text-cyan-300 font-semibold transition-colors">
                  <span className="font-mono text-[11px]">কণ্ঠ: {preset.recommendedVoiceId}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    প্রয়োগ করুন <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
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
  );
};

