import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
  Radio,
  FileAudio
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { formatTimeBengali, toBengaliNumber } from '../utils/bengaliUtils';

interface AudioPlayerProps {
  item: GeneratedAudioItem;
  onDownload: (item: GeneratedAudioItem) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ item, onDownload }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);

  // Re-sync when new item loads
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.load();
    }
  }, [item.id, item.audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error('Play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || item.duration || 0);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(item.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-slate-900/80 dark:bg-slate-900/90 rounded-2xl border border-indigo-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] backdrop-blur-md transition-all duration-200">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={item.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header with Voice info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
            {item.voiceId}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {item.voiceName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                {item.format.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
              {item.text}
            </p>
          </div>
        </div>

        {/* Download & Copy button */}
        <div className="flex items-center gap-2">
          <button
            id="player-share-btn"
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-xs"
            title="লেখা কপি করুন"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>

          <button
            id="player-download-btn"
            type="button"
            onClick={() => onDownload(item)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
            title="অডিও ফাইল ডাউনলোড করুন"
          >
            <Download className="w-4 h-4" />
            <span>ডাউনলোড করুন</span>
          </button>
        </div>
      </div>

      {/* Waveform Visualizer simulation */}
      <div className="mb-4 bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex items-center justify-center gap-1.5 h-16 overflow-hidden shadow-inner">
        {Array.from({ length: 42 }).map((_, idx) => {
          const progress = duration > 0 ? currentTime / duration : 0;
          const isPassed = idx / 42 <= progress;
          // Seed heights
          const baseHeight = 12 + ((idx * 9) % 32);
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                  : 'bg-slate-800'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: `${isPlaying ? Math.max(8, (baseHeight * (0.6 + Math.random() * 0.8))) : baseHeight}px`,
              }}
            />
          );
        })}
      </div>

      {/* Progress Bar with Time */}
      <div className="space-y-1.5 mb-4">
        <input
          id="player-seekbar"
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-400">
          <span>{formatTimeBengali(currentTime)}</span>
          <span>{formatTimeBengali(duration)}</span>
        </div>
      </div>

      {/* Bottom Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback speed selector */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {toBengaliNumber(rate)}x
            </button>
          ))}
        </div>

        {/* Center Play / Pause / Skip buttons */}
        <div className="flex items-center gap-3">
          {/* Skip -5s */}
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="৫ সেকেন্ড পেছনে যান"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause Main */}
          <button
            id="player-play-pause-btn"
            type="button"
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.55)] transition-transform active:scale-95 border border-indigo-400/30"
            title={isPlaying ? 'বিরতি দিন' : 'চালু করুন'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip +5s */}
          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="৫ সেকেন্ড এগিয়ে যান"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

