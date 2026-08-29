import React from 'react';
import { Play, Pause, Loader2, Heart, Check, User, UserCheck } from 'lucide-react';
import { VoiceProfile } from '../types';

interface VoiceCardProps {
  voice: VoiceProfile;
  isSelected: boolean;
  onSelect: (voice: VoiceProfile) => void;
  isPlayingPreview: boolean;
  isLoadingPreview: boolean;
  onTogglePreview: (voice: VoiceProfile) => void;
  isFavorite: boolean;
  onToggleFavorite: (voiceId: string) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected,
  onSelect,
  isPlayingPreview,
  isLoadingPreview,
  onTogglePreview,
  isFavorite,
  onToggleFavorite,
}) => {
  const isMale = voice.gender === 'male';

  return (
    <div
      id={`voice-card-${voice.id}`}
      onClick={() => onSelect(voice)}
      className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900/95 dark:bg-slate-900/95 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/60'
          : 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80 shadow-xs'
      }`}
    >
      {/* Top row: ID badge, Gender, Favorite */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Voice ID Badge */}
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono border ${
              isMale
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
            }`}
          >
            {voice.id}
          </span>

          {/* Gender tag */}
          <span className="flex items-center gap-1 text-xs text-slate-400">
            {isMale ? (
              <User className="w-3 h-3 text-indigo-400" />
            ) : (
              <UserCheck className="w-3 h-3 text-pink-400" />
            )}
            <span>{isMale ? 'পুরুষ' : 'নারী'}</span>
          </span>

          {/* Style tag */}
          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[11px] font-medium text-slate-300 border border-slate-800">
            {voice.styleBn}
          </span>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(voice.id);
          }}
          className={`p-1.5 rounded-xl transition-colors ${
            isFavorite
              ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
              : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
          }`}
          title={isFavorite ? 'প্রিয় তালিকা থেকে বাদ দিন' : 'প্রিয় তালিকায় যুক্ত করুন'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Voice Name & Description */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-bold transition-colors ${isSelected ? 'text-white font-extrabold' : 'text-slate-200 group-hover:text-white'}`}>
            {voice.name}
          </h4>
          {isSelected && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0">
              <Check className="w-3 h-3" />
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {voice.description}
        </p>
      </div>

      {/* Bottom row: Preview button & indicator */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          id={`voice-preview-btn-${voice.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePreview(voice);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
            isPlayingPreview
              ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)] animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-indigo-500/40'
          }`}
          title="নমুনা উচ্চারণ শুনুন"
        >
          {isLoadingPreview ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPlayingPreview ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
          )}
          <span>{isPlayingPreview ? 'বিরতি' : 'নমুনা শুনুন'}</span>
        </button>

        {isPlayingPreview ? (
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-0.5 bg-indigo-400 rounded-full animate-wave-1"></span>
            <span className="w-0.5 bg-indigo-400 rounded-full animate-wave-2"></span>
            <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-3"></span>
            <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-4"></span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">
            {voice.language === 'bn-BD' ? 'বাংলাদেশ' : 'কলকাতা'}
          </span>
        )}
      </div>
    </div>
  );
};

