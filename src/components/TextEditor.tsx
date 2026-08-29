import React, { useRef } from 'react';
import { 
  Clipboard, 
  Trash2, 
  Sparkles, 
  Clock, 
  AlignLeft, 
  Pause, 
  Flame, 
  Quote 
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface TextEditorProps {
  text: string;
  onChange: (newText: string) => void;
  onClear: () => void;
  onInsertSample: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  onClear,
  onInsertSample,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Statistics calculation
  const charCount = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lineCount = text ? text.split('\n').length : 0;
  
  // Approximate reading time (average 130 Bengali words per minute)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 130) * 60));
  const estMins = Math.floor(estimatedSeconds / 60);
  const estSecs = estimatedSeconds % 60;
  const readTimeStr = estMins > 0 
    ? `${toBengaliNumber(estMins)} মিনিট ${toBengaliNumber(estSecs)} সেকেন্ড`
    : `${toBengaliNumber(estSecs)} সেকেন্ড`;

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onChange(text ? text + ' ' + clipboardText : clipboardText);
      }
    } catch (err) {
      console.warn('Clipboard paste blocked:', err);
    }
  };

  const insertTextAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || '') + suffix;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 0)
      );
    }, 50);
  };

  return (
    <div className="bg-slate-900/70 dark:bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden flex flex-col transition-all duration-200 backdrop-blur-md">
      {/* Editor Header Toolbar */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            লেখা লিখুন (Enter Text)
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            • ইউনিকোড সমর্থিত
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="editor-sample-btn"
            type="button"
            onClick={onInsertSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all shadow-xs"
            title="নমুনা বাংলা অনুচ্ছেদ যুক্ত করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>নমুনা লেখা</span>
          </button>

          <button
            id="editor-paste-btn"
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs"
            title="ক্লিপবোর্ড থেকে পেস্ট করুন"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-400" />
            <span>পেস্ট</span>
          </button>

          {text.length > 0 && (
            <button
              id="editor-clear-btn"
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
              title="সব লেখা মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>মুছুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Formatting & SSML / Punctuation helpers */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-thin">
        <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold shrink-0 mr-1">
          টুলস:
        </span>

        <button
          type="button"
          onClick={() => insertTextAtCursor('\n\n')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:border-indigo-500/40 transition-colors shrink-0 font-medium"
          title="নতুন অনুচ্ছেদ"
        >
          <AlignLeft className="w-3 h-3 text-slate-400" />
          <span>অনুচ্ছেদ</span>
        </button>

        <button
          type="button"
          onClick={() => insertTextAtCursor(' [বিরতি] ')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:border-amber-500/40 transition-colors shrink-0 font-medium"
          title="১ সেকেন্ড বিরতি যোগ করুন"
        >
          <Pause className="w-3 h-3 text-amber-400" />
          <span>বিরতি (১ সে.)</span>
        </button>

        <button
          type="button"
          onClick={() => insertTextAtCursor(' **', '** ')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:border-orange-500/40 transition-colors shrink-0 font-medium"
          title="বিশেষ জোর দিন (Emphasis)"
        >
          <Flame className="w-3 h-3 text-orange-400" />
          <span>জোর দিন</span>
        </button>

        <button
          type="button"
          onClick={() => insertTextAtCursor('। ')}
          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:border-indigo-500/40 transition-colors shrink-0 font-bold"
          title="দাঁড়ি যোগ করুন"
        >
          <span>দাঁড়ি (।)</span>
        </button>

        <button
          type="button"
          onClick={() => insertTextAtCursor('“', '”')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 hover:border-cyan-500/40 transition-colors shrink-0 font-medium"
          title="উদ্ধৃতি চিহ্ন"
        >
          <Quote className="w-3 h-3 text-cyan-400" />
          <span>উদ্ধৃতি (“ ”)</span>
        </button>
      </div>

      {/* Textarea Area */}
      <div className="relative flex-1 p-5 bg-slate-950/30">
        <textarea
          id="bangla-text-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="এখানে আপনার বাংলা লেখা লিখুন বা পেস্ট করুন..."
          className="w-full h-56 sm:h-72 p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 resize-y text-base sm:text-lg leading-relaxed font-bengali shadow-inner transition-all"
          dir="ltr"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer / Live Stats Bar */}
      <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-5 text-slate-400">
          <div>
            অক্ষর:{' '}
            <span className="font-bold text-slate-200 font-mono">
              {toBengaliNumber(charCount)}
            </span>
          </div>
          <div>
            শব্দ:{' '}
            <span className="font-bold text-slate-200 font-mono">
              {toBengaliNumber(wordCount)}
            </span>
          </div>
          <div>
            লাইন:{' '}
            <span className="font-bold text-slate-200 font-mono">
              {toBengaliNumber(lineCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>আনুমানিক সময়: {readTimeStr}</span>
        </div>
      </div>
    </div>
  );
};

