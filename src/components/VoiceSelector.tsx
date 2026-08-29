import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Heart, Clock, Users, Sparkles, Filter, X } from 'lucide-react';
import { VoiceProfile } from '../types';
import { VoiceCard } from './VoiceCard';
import { toBengaliNumber } from '../utils/bengaliUtils';
import { requestVoicePreview } from '../services/apiService';
import { speakBrowserSpeech } from '../services/localTtsService';

interface VoiceSelectorProps {
  voices: VoiceProfile[];
  selectedVoice: VoiceProfile;
  onSelectVoice: (voice: VoiceProfile) => void;
  favoriteIds: string[];
  onToggleFavorite: (voiceId: string) => void;
  recentVoiceIds: string[];
  isOnline: boolean;
}

const STYLE_FILTERS = [
  { id: 'all', label: 'সব ধরন' },
  { id: 'গম্ভীর', label: 'গম্ভীর' },
  { id: 'শান্ত', label: 'শান্ত ও স্নিগ্ধ' },
  { id: 'আবেগপূর্ণ', label: 'আবেগপূর্ণ' },
  { id: 'গল্প', label: 'গল্প ও আখ্যান' },
  { id: 'সংবাদ', label: 'সংবাদ' },
  { id: 'প্রফেশনাল', label: 'প্রফেশনাল' },
  { id: 'অনুপ্রেরণামূলক', label: 'অনুপ্রেরণামূলক' },
  { id: 'ডকুমেন্টারি', label: 'ডকুমেন্টারি' },
  { id: 'বিজ্ঞাপন', label: 'বিজ্ঞাপন' },
  { id: 'কবিতা', label: 'কবিতা ও আবৃত্তি' },
  { id: 'শিক্ষা', label: 'শিক্ষামূলক' },
  { id: 'পডকাস্ট', label: 'পডকাস্ট' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  favoriteIds,
  onToggleFavorite,
  recentVoiceIds,
  isOnline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [viewTab, setViewTab] = useState<'all' | 'favorites' | 'recents'>('all');

  // Preview Audio State
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Stop preview playback on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }
    };
  }, []);

  const handleTogglePreview = async (voice: VoiceProfile) => {
    // If already playing this voice, stop it
    if (previewingVoiceId === voice.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }
      setPreviewingVoiceId(null);
      return;
    }

    // Stop any current audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
    }

    setLoadingPreviewId(voice.id);

    try {
      if (isOnline) {
        // Fetch server audio preview
        const data = await requestVoicePreview(voice.id, voice.sampleText);
        if (data.audioBase64) {
          const audio = new Audio(data.audioBase64);
          previewAudioRef.current = audio;
          audio.playbackRate = voice.speedDefault;
          audio.onended = () => {
            setPreviewingVoiceId(null);
          };
          audio.onerror = () => {
            setPreviewingVoiceId(null);
          };
          await audio.play();
          setPreviewingVoiceId(voice.id);
        }
      } else {
        // Offline preview via browser Web Speech API
        const cancelFn = speakBrowserSpeech(
          voice.sampleText,
          voice.speedDefault,
          voice.pitchDefault,
          100,
          () => setPreviewingVoiceId(null)
        );
        cancelSpeechRef.current = cancelFn;
        setPreviewingVoiceId(voice.id);
      }
    } catch (err) {
      console.warn('Online preview failed, falling back to local speech:', err);
      try {
        const cancelFn = speakBrowserSpeech(
          voice.sampleText,
          voice.speedDefault,
          voice.pitchDefault,
          100,
          () => setPreviewingVoiceId(null)
        );
        cancelSpeechRef.current = cancelFn;
        setPreviewingVoiceId(voice.id);
      } catch (localErr) {
        console.error('Local speech error:', localErr);
      }
    } finally {
      setLoadingPreviewId(null);
    }
  };

  // Filtered voice list
  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      // Tab filter
      if (viewTab === 'favorites' && !favoriteIds.includes(voice.id)) {
        return false;
      }
      if (viewTab === 'recents' && !recentVoiceIds.includes(voice.id)) {
        return false;
      }

      // Gender filter
      if (genderFilter !== 'all' && voice.gender !== genderFilter) {
        return false;
      }

      // Style filter
      if (styleFilter !== 'all' && !voice.tags.includes(styleFilter)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = voice.id.toLowerCase().includes(query);
        const matchesName = voice.name.toLowerCase().includes(query);
        const matchesDesc = voice.description.toLowerCase().includes(query);
        const matchesStyle = voice.styleBn.toLowerCase().includes(query);
        const matchesTag = voice.tags.some((t) => t.toLowerCase().includes(query));
        return matchesId || matchesName || matchesDesc || matchesStyle || matchesTag;
      }

      return true;
    });
  }, [voices, viewTab, favoriteIds, recentVoiceIds, genderFilter, styleFilter, searchQuery]);

  // Counts
  const maleCount = voices.filter((v) => v.gender === 'male').length;
  const femaleCount = voices.filter((v) => v.gender === 'female').length;

  return (
    <div className="bg-slate-900/70 dark:bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden flex flex-col transition-all duration-200 backdrop-blur-md">
      {/* Header with Title & Main View Tabs */}
      <div className="p-5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span>কণ্ঠ নির্বাচন (Voices Library)</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                মোট {toBengaliNumber(voices.length)}টি
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ৫০টি পুরুষ ও ৫০টি নারী ভয়েস প্রোফাইল থেকে পছন্দ করুন
            </p>
          </div>

          {/* Primary View Tabs: All, Favorites, Recents */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              id="voice-tab-all"
              type="button"
              onClick={() => setViewTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>সব ({toBengaliNumber(voices.length)})</span>
            </button>

            <button
              id="voice-tab-favs"
              type="button"
              onClick={() => setViewTab('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'favorites'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>প্রিয় ({toBengaliNumber(favoriteIds.length)})</span>
            </button>

            <button
              id="voice-tab-recents"
              type="button"
              onClick={() => setViewTab('recents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'recents'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>সাম্প্রতিক ({toBengaliNumber(recentVoiceIds.length)})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Gender Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="voice-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কণ্ঠের নাম, ধরন বা আইডি (যেমন M01, F15) দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <button
              id="gender-filter-all"
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                genderFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              সব ({toBengaliNumber(voices.length)})
            </button>

            <button
              id="gender-filter-male"
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                genderFilter === 'male'
                  ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              পুরুষ ({toBengaliNumber(maleCount)})
            </button>

            <button
              id="gender-filter-female"
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                genderFilter === 'female'
                  ? 'bg-pink-500/25 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              নারী ({toBengaliNumber(femaleCount)})
            </button>
          </div>
        </div>

        {/* Style Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3.5 pb-1 scrollbar-thin">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" />
            <span>ধরন:</span>
          </span>
          {STYLE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStyleFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                styleFilter === f.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.35)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Grid List */}
      <div className="p-4 sm:p-5 flex-1 max-h-[500px] overflow-y-auto space-y-3">
        {filteredVoices.length === 0 ? (
          <div className="text-center py-14 px-4">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-2.5 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">
              কোনো কণ্ঠ খুঁজে পাওয়া যায়নি
            </p>
            <p className="text-xs text-slate-500 mt-1">
              অনুগ্রহ করে অন্য কোনো নাম, ফিল্টার বা কিওয়ার্ড দিয়ে চেষ্টা করুন
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('all');
                setStyleFilter('all');
                setViewTab('all');
              }}
              className="mt-3.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
            >
              সব ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredVoices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                isSelected={selectedVoice.id === voice.id}
                onSelect={onSelectVoice}
                isPlayingPreview={previewingVoiceId === voice.id}
                isLoadingPreview={loadingPreviewId === voice.id}
                onTogglePreview={handleTogglePreview}
                isFavorite={favoriteIds.includes(voice.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info showing selected voice */}
      <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
            নির্বাচিত কণ্ঠ:
          </span>
          <span className="font-bold text-indigo-400 truncate">
            {selectedVoice.name} ({selectedVoice.id})
          </span>
        </div>
        <span className="shrink-0 text-slate-500 text-[11px] font-mono">
          দেখাচ্ছে {toBengaliNumber(filteredVoices.length)}/{toBengaliNumber(voices.length)}
        </span>
      </div>
    </div>
  );
};

