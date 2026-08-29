import React from 'react';
import { Gauge, Sliders, Volume2, RotateCcw, FileAudio, Sparkles } from 'lucide-react';
import { AudioSettings, AudioFormat } from '../types';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface AudioControlsProps {
  settings: AudioSettings;
  onChange: (newSettings: AudioSettings) => void;
  onReset: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  const handleSpeedChange = (speed: number) => {
    onChange({ ...settings, speed });
  };

  const handlePitchChange = (pitch: number) => {
    onChange({ ...settings, pitch });
  };

  const handleVolumeChange = (volume: number) => {
    onChange({ ...settings, volume });
  };

  const handleFormatChange = (format: AudioFormat) => {
    onChange({ ...settings, format });
  };

  const getPitchLabel = (pitch: number): string => {
    if (pitch < -1) return 'গভীর / ভারী';
    if (pitch < 0) return 'হালকা ভারী';
    if (pitch === 0) return 'স্বাভাবিক';
    if (pitch <= 1) return 'হালকা চিকন';
    return 'উচ্চ / তীক্ষ্ণ';
  };

  return (
    <div className="bg-slate-900/70 dark:bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-200">
      {/* Controls Header */}
      <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs uppercase tracking-widest text-slate-300 font-bold">
            অডিও সেটিংস ও কন্ট্রোল
          </h3>
        </div>

        <button
          id="controls-reset-btn"
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs"
          title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>ডিফল্ট</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* 1. Speed Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="speed-slider" className="font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>গতি (Speed)</span>
            </label>
            <span className="font-bold text-indigo-400 font-mono text-sm">
              {toBengaliNumber(settings.speed.toFixed(2))}x
            </span>
          </div>
          <input
            id="speed-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>ধীর (০.৫x)</span>
            <span>স্বাভাবিক (১.০x)</span>
            <span>দ্রুত (২.০x)</span>
          </div>
        </div>

        {/* 2. Pitch Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="pitch-slider" className="font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>পিচ (Pitch)</span>
            </label>
            <span className="font-bold text-cyan-400 font-mono text-xs">
              {getPitchLabel(settings.pitch)} ({toBengaliNumber(settings.pitch)})
            </span>
          </div>
          <input
            id="pitch-slider"
            type="range"
            min="-3"
            max="3"
            step="1"
            value={settings.pitch}
            onChange={(e) => handlePitchChange(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>ভারী (-৩)</span>
            <span>স্বাভাবিক (০)</span>
            <span>তীক্ষ্ণ (+৩)</span>
          </div>
        </div>

        {/* 3. Volume Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="volume-slider" className="font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>ভলিউম (Vol)</span>
            </label>
            <span className="font-bold text-indigo-400 font-mono text-sm">
              {toBengaliNumber(settings.volume)}%
            </span>
          </div>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>০%</span>
            <span>৫০%</span>
            <span>১০০%</span>
          </div>
        </div>
      </div>

      {/* Format & Quality Selector */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <FileAudio className="w-3.5 h-3.5 text-slate-500" />
            <span>ফরম্যাট:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              id="format-mp3-btn"
              type="button"
              onClick={() => handleFormatChange('mp3')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all text-xs ${
                settings.format === 'mp3'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MP3
            </button>
            <button
              id="format-wav-btn"
              type="button"
              onClick={() => handleFormatChange('wav')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all text-xs ${
                settings.format === 'wav'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WAV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500 text-[11px] uppercase tracking-wider">কোয়ালিটি:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold text-xs border border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
            HD 24kHz Audio
          </span>
        </div>
      </div>
    </div>
  );
};

