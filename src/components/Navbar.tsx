import React from 'react';
import { Volume2, Sun, Moon, Wifi, WifiOff, History, Sparkles, DownloadCloud } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isOnline: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  isOnline,
  historyCount,
  onOpenHistory,
  onOpenPresets,
  canInstallPwa,
  onInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.45)] border border-indigo-400/30">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                বাংলা কণ্ঠ <span className="text-xs font-semibold text-indigo-400 ml-0.5 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Pro</span>
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
                ১০০টি কণ্ঠ
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              উন্নত বাংলা এআই টেক্সট-টু-স্পিচ ও অডিও জেনারেটর
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline status badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs ${
              isOnline
                ? 'bg-slate-900/90 text-slate-200 border-slate-700/80 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
            }`}
            title={isOnline ? 'ইন্টারনেট সংযুক্ত রয়েছে' : 'অফলাইন মোড সক্রিয়'}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold">{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
          </div>

          {/* Presets Button */}
          <button
            id="navbar-presets-btn"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-700/60 hover:border-indigo-500/40 shadow-xs"
            title="তৈরি করা রেডি-মেড প্রিসেট দেখুন"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">প্রিসেট</span>
          </button>

          {/* History Button */}
          <button
            id="navbar-history-btn"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-700/60 hover:border-indigo-500/40 shadow-xs"
            title="পূর্বে তৈরি করা অডিওর ইতিহাস"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">ইতিহাস</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-indigo-200 bg-indigo-600/80 rounded-full border border-indigo-400/30">
                {toBengaliNumber(historyCount)}
              </span>
            )}
          </button>

          {/* PWA Install Button */}
          {canInstallPwa && (
            <button
              id="navbar-install-pwa-btn"
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all active:scale-95"
              title="অ্যাপ ইনস্টল করুন"
            >
              <DownloadCloud className="w-4 h-4" />
              <span className="hidden md:inline">ইনস্টল</span>
            </button>
          )}

          {/* Dark/Light Mode Toggle */}
          <button
            id="navbar-darkmode-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-700/60 hover:border-slate-600"
            aria-label={darkMode ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
            title={darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};

