import React, { useState, useEffect, useCallback } from 'react';
import { BANGLA_VOICES } from './data/voices';
import { BANGLA_PRESETS } from './data/presets';
import { VoiceProfile, AudioSettings, GeneratedAudioItem, Preset, AudioFormat } from './types';
import { Navbar } from './components/Navbar';
import { TextEditor } from './components/TextEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioControls } from './components/AudioControls';
import { GenerateButton } from './components/GenerateButton';
import { AudioPlayer } from './components/AudioPlayer';
import { PresetsModal } from './components/PresetsModal';
import { HistoryModal } from './components/HistoryModal';
import { DownloadModal } from './components/DownloadModal';
import { OfflineBanner } from './components/OfflineBanner';
import {
  saveAudioToHistory,
  getAllHistory,
  deleteHistoryItem,
  clearAllHistory,
  getFavoriteVoiceIds,
  toggleFavoriteVoice,
  getRecentVoiceIds,
  addRecentVoice,
  getSavedSettings,
  saveSettings,
} from './services/storageService';
import { requestAudioGeneration } from './services/apiService';
import { generateOfflineAudioBuffer } from './services/localTtsService';
import { downloadAudioFromUrl, generateDefaultFilename } from './services/audioExport';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bangla_tts_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Online / Offline state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);

  // Editor Text State
  const [text, setText] = useState<string>(
    'বাংলা আমাদের মাতৃভাষা। এটি একটি অত্যন্ত সমৃদ্ধ ও শ্রুতিমধুর ভাষা। এই আধুনিক টেক্সট-টু-স্পিচ অ্যাপ্লিকেশনের মাধ্যমে আপনি যেকোনো বাংলা লেখাকে স্বাভাবিক ও জীবন্ত অডিওতে রূপান্তর করতে পারবেন।'
  );

  // Selected Voice & Settings
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(BANGLA_VOICES[0]);
  const [settings, setSettingsState] = useState<AudioSettings>(getSavedSettings);

  // Generation & Player State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Storage & History Lists
  const [historyItems, setHistoryItems] = useState<GeneratedAudioItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentVoiceIds, setRecentVoiceIds] = useState<string[]>([]);

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [downloadTargetItem, setDownloadTargetItem] = useState<GeneratedAudioItem | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bangla_tts_dark_mode', String(darkMode));
  }, [darkMode]);

  // Online/Offline listeners & PWA prompt
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register service worker if available
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Initial load from storage
  const loadInitialData = useCallback(async () => {
    try {
      const [history, favs, recents] = await Promise.all([
        getAllHistory(),
        getFavoriteVoiceIds(),
        getRecentVoiceIds(),
      ]);
      setHistoryItems(history);
      setFavoriteIds(favs);
      setRecentVoiceIds(recents);

      if (history.length > 0 && !currentAudio) {
        setCurrentAudio(history[0]);
      }
    } catch (e) {
      console.warn('Error loading initial storage data:', e);
    }
  }, [currentAudio]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Settings update wrapper
  const handleSettingsChange = (newSettings: AudioSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    const defaultSettings: AudioSettings = {
      speed: selectedVoice.speedDefault || 1.0,
      pitch: selectedVoice.pitchDefault || 0,
      volume: 100,
      format: 'mp3',
      quality: 'high',
    };
    handleSettingsChange(defaultSettings);
  };

  // Voice Selection Handler
  const handleSelectVoice = (voice: VoiceProfile) => {
    setSelectedVoice(voice);
    // Update default pitch and speed if at defaults
    handleSettingsChange({
      ...settings,
      speed: voice.speedDefault,
      pitch: voice.pitchDefault,
    });
  };

  // Toggle Favorite
  const handleToggleFavorite = async (voiceId: string) => {
    const isNowFav = await toggleFavoriteVoice(voiceId);
    setFavoriteIds((prev) =>
      isNowFav ? [...prev, voiceId] : prev.filter((id) => id !== voiceId)
    );
  };

  // Preset Selection
  const handleSelectPreset = (preset: Preset) => {
    setText(preset.samplePrompt);
    const recVoice = BANGLA_VOICES.find((v) => v.id === preset.recommendedVoiceId);
    if (recVoice) {
      setSelectedVoice(recVoice);
    }
    handleSettingsChange({
      ...settings,
      speed: preset.speed,
      pitch: preset.pitch,
      volume: preset.volume,
    });
    setSuccessMsg(`"${preset.name}" প্রিসেট সফলভাবে প্রয়োগ করা হয়েছে!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Insert Sample Text
  const handleInsertSample = () => {
    const sample = selectedVoice.sampleText || BANGLA_PRESETS[0].samplePrompt;
    setText((prev) => (prev ? prev + '\n\n' + sample : sample));
  };

  // Generate Audio Action
  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setErrorMsg('অনুগ্রহ করে কিছু বাংলা লেখা প্রদান করুন।');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGenerating(true);
    setProgressStep('বাংলা লেখা বিশ্লেষণ করা হচ্ছে...');

    const startTime = Date.now();

    try {
      setTimeout(() => {
        if (isGenerating) setProgressStep('কণ্ঠ ও পিচ সমন্বয় করা হচ্ছে...');
      }, 500);

      setTimeout(() => {
        if (isGenerating) setProgressStep('উচ্চমানের অডিও স্ট্রিম প্রস্তুত হচ্ছে...');
      }, 1200);

      let audioDataUrl = '';
      let calculatedDuration = 0;
      let usedProvider: 'online_api' | 'offline_local' = 'online_api';

      if (isOnline) {
        try {
          const res = await requestAudioGeneration({
            text: text.trim(),
            voiceId: selectedVoice.id,
            speed: settings.speed,
            pitch: settings.pitch,
            volume: settings.volume,
            format: settings.format,
            quality: settings.quality,
          });

          if (res.success && res.audioBase64) {
            audioDataUrl = res.audioBase64;
            calculatedDuration = res.duration;
            usedProvider = 'online_api';
          } else {
            throw new Error(res.error || 'অডিও তৈরি করা যায়নি');
          }
        } catch (apiErr) {
          console.warn('Online API failed, switching to local offline synthesizer:', apiErr);
          // Fallback to offline web audio
          const offlineRes = await generateOfflineAudioBuffer(
            text,
            settings.speed,
            settings.pitch,
            selectedVoice.gender === 'female'
          );
          audioDataUrl = offlineRes.url;
          calculatedDuration = offlineRes.duration;
          usedProvider = 'offline_local';
        }
      } else {
        // Direct offline synthesis
        const offlineRes = await generateOfflineAudioBuffer(
          text,
          settings.speed,
          settings.pitch,
          selectedVoice.gender === 'female'
        );
        audioDataUrl = offlineRes.url;
        calculatedDuration = offlineRes.duration;
        usedProvider = 'offline_local';
      }

      // Create new audio item
      const newItem: GeneratedAudioItem = {
        id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        text: text.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        audioUrl: audioDataUrl,
        duration: calculatedDuration,
        createdAt: Date.now(),
        settings: { ...settings },
        format: settings.format,
        provider: usedProvider,
      };

      // Save to IndexedDB & Recents
      await saveAudioToHistory(newItem);
      await addRecentVoice(selectedVoice.id);

      setCurrentAudio(newItem);
      setHistoryItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
      setRecentVoiceIds((prev) => [selectedVoice.id, ...prev.filter((id) => id !== selectedVoice.id)]);

      setSuccessMsg('অডিও সফলভাবে তৈরি হয়েছে! নিচে প্লেয়ার থেকে শুনুন অথবা ডাউনলোড করুন।');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Audio Generation Error:', err);
      setErrorMsg(err.message || 'দুঃখিত, অডিও তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  // History Actions
  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryItem(id);
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
    }
  };

  const handleClearAllHistory = async () => {
    await clearAllHistory();
    setHistoryItems([]);
    setCurrentAudio(null);
  };

  // Download Trigger
  const handleOpenDownloadModal = (item: GeneratedAudioItem) => {
    setDownloadTargetItem(item);
    setIsDownloadOpen(true);
  };

  // PWA Install Click
  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-bengali transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isOnline={isOnline}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
      />

      {/* Offline Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Ambient background glows for Immersive UI */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-20 right-4 z-50 max-w-sm space-y-2 pointer-events-none">
        {successMsg && (
          <div className="p-4 bg-slate-900/95 text-slate-100 rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.3)] border border-indigo-500/50 flex items-center gap-3 text-xs font-semibold animate-fade-in pointer-events-auto backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-slate-900/95 text-slate-100 rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.3)] border border-rose-500/50 flex items-center gap-3 text-xs font-semibold animate-fade-in pointer-events-auto backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Active Audio Player Banner (if audio is generated/selected) */}
        {currentAudio && (
          <section id="main-audio-player-section" className="animate-fade-in">
            <AudioPlayer item={currentAudio} onDownload={handleOpenDownloadModal} />
          </section>
        )}

        {/* Two-Column Core Layout: Left Text Editor & Controls, Right 100 Voice Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols on large): Text Editor & Audio Adjustments */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Bengali Text Editor */}
            <TextEditor
              text={text}
              onChange={setText}
              onClear={() => setText('')}
              onInsertSample={handleInsertSample}
            />

            {/* 2. Audio Settings Sliders (Speed, Pitch, Volume, Format) */}
            <AudioControls
              settings={settings}
              onChange={handleSettingsChange}
              onReset={handleResetSettings}
            />

            {/* 3. Primary Generate Button */}
            <GenerateButton
              onGenerate={handleGenerateAudio}
              isGenerating={isGenerating}
              progressStep={progressStep}
              disabled={text.trim().length === 0}
              isOnline={isOnline}
            />
          </div>

          {/* Right Column (7 Cols on large): 100 Voices Selector */}
          <div className="lg:col-span-7">
            <VoiceSelector
              voices={BANGLA_VOICES}
              selectedVoice={selectedVoice}
              onSelectVoice={handleSelectVoice}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              recentVoiceIds={recentVoiceIds}
              isOnline={isOnline}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md py-4 mt-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>বাংলা Text-to-Audio এআই ভয়েস প্ল্যাটফর্ম • ১০০টি ভয়েস প্রোফাইল</span>
          <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            অফলাইন ও অনলাইন সমর্থিত
          </span>
        </div>
      </footer>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyItems}
        onPlayItem={(item) => {
          setCurrentAudio(item);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDownloadItem={handleOpenDownloadModal}
        onDeleteItem={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        currentPlayingId={currentAudio?.id}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        item={downloadTargetItem}
      />
    </div>
  );
}

export default App;

