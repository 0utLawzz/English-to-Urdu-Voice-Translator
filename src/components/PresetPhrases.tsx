import { useState } from 'react';
import { PRESET_PHRASES, OFFLINE_CATEGORIES } from '../utils/offlineDictionary';
import { PresetPhrase } from '../types';
import { Sparkles, MessageSquare, Compass, ShoppingBag, Flame, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PresetPhrasesProps {
  onSelectPhrase: (phrase: PresetPhrase) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Common Greetings': <MessageSquare size={14} />,
  'Travel & Directions': <Compass size={14} />,
  'Dining & Shopping': <ShoppingBag size={14} />,
  'Survival & Emergency': <Flame size={14} className="text-red-500 animate-pulse" />,
  'Simple Questions': <HelpCircle size={14} />,
};

export default function PresetPhrases({ onSelectPhrase }: PresetPhrasesProps) {
  const [activeCategory, setActiveCategory] = useState<string>(OFFLINE_CATEGORIES[0]);

  const filteredPhrases = PRESET_PHRASES.filter(
    (phrase) => phrase.category === activeCategory
  );

  return (
    <div id="presets-container" className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Quick-Access Phrases
        </h3>
      </div>

      {/* Category Pills */}
      <div 
        id="presets-category-pills"
        className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-x-auto no-scrollbar"
      >
        {OFFLINE_CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              id={`cat-pill-${category.replace(/\s+/g, '-').toLowerCase()}`}
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {CATEGORY_ICONS[category]}
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* Phrase Grid */}
      <div 
        id="presets-phrases-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1"
      >
        {filteredPhrases.map((phrase, idx) => (
          <motion.button
            id={`phrase-card-${idx}`}
            key={phrase.english}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            onClick={() => onSelectPhrase(phrase)}
            className="flex flex-col items-start text-left p-3.5 bg-white hover:bg-indigo-50/40 dark:bg-slate-900/40 dark:hover:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-950 transition-all shadow-sm hover:shadow group"
          >
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 transition-colors">
              {phrase.english}
            </div>
            
            <div 
              className="text-base font-medium text-slate-900 dark:text-slate-100 mt-1.5 font-sans"
              dir="rtl"
            >
              {phrase.urdu}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
              "{phrase.romanUrdu}"
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
