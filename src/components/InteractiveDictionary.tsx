import { DictionaryWord } from '../types';
import { BookOpen, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface InteractiveDictionaryProps {
  words: DictionaryWord[];
  explanation?: string;
}

const TYPE_COLORS: Record<string, string> = {
  noun: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900',
  verb: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
  pronoun: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900',
  adjective: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
  interjection: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
  phrase: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900',
  adverb: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900',
};

export default function InteractiveDictionary({ words, explanation }: InteractiveDictionaryProps) {
  if (!words || words.length === 0) {
    return null;
  }

  return (
    <div id="interactive-dictionary-card" className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-all">
      <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
        <BookOpen size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Vocabulary Breakdown
        </h3>
      </div>

      <div 
        id="dictionary-words-grid"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {words.map((item, idx) => {
          const typeLower = item.type.toLowerCase();
          const badgeClass = TYPE_COLORS[typeLower] || 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-850 dark:text-slate-300 dark:border-slate-700';

          return (
            <motion.div
              id={`dict-item-${idx}`}
              key={item.word + idx}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="flex flex-col p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {item.word}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass} uppercase tracking-wider`}>
                  {item.type}
                </span>
              </div>

              <div className="flex justify-between items-baseline mt-2 pt-1 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Meaning:</span>
                <span className="font-medium text-slate-900 dark:text-indigo-300 text-sm" dir="rtl">
                  {item.translation}
                </span>
              </div>

              {item.context && (
                <p className="text-[10px] text-slate-400 mt-1.5 italic leading-normal border-l-2 border-slate-200 dark:border-slate-800 pl-1.5">
                  {item.context}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {explanation && (
        <div 
          id="dictionary-explanation"
          className="mt-2 flex gap-2.5 p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-950/30 rounded-xl"
        >
          <HelpCircle size={15} className="text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed font-sans">
            <span className="font-semibold">Linguistic Note:</span> {explanation}
          </div>
        </div>
      )}
    </div>
  );
}
