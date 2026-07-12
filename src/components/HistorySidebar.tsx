import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Bookmark, Search, Trash2, Volume2, History, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  onPlayCachedAudio: (item: HistoryItem, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistorySidebar({
  history,
  onSelectHistoryItem,
  onToggleBookmark,
  onDeleteHistoryItem,
  onClearHistory,
  onPlayCachedAudio,
  isOpen,
  onClose,
}: HistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translated.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transliteration.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBookmark = !showOnlyBookmarks || item.bookmarked;

    return matchesSearch && matchesBookmark;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay Background */}
          <motion.div
            id="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40 lg:hidden"
          />

          {/* Sidebar drawer container */}
          <motion.div
            id="sidebar-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Saved & History
                </h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {history.length}
                </span>
              </div>
              <button
                id="close-sidebar-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="search-history-input"
                  type="text"
                  placeholder="Search past translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Toggle filters */}
              <div className="flex items-center justify-between">
                <button
                  id="toggle-bookmarks-btn"
                  onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    showOnlyBookmarks
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark size={11} className={showOnlyBookmarks ? 'fill-amber-500 text-amber-500' : ''} />
                  <span>Starred Only</span>
                </button>

                {history.length > 0 && (
                  <button
                    id="clear-all-history-btn"
                    onClick={onClearHistory}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-[10px] font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Trash2 size={11} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500">
                  <Bookmark size={24} className="stroke-1 mb-2 opacity-60" />
                  <p className="text-xs">No records found</p>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    {showOnlyBookmarks ? 'Try unchecking Starred Only' : 'Translate phrases to see history'}
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    id={`history-item-${item.id}`}
                    key={item.id}
                    onClick={() => onSelectHistoryItem(item)}
                    className="group relative flex flex-col p-3 bg-slate-50 hover:bg-indigo-50/20 dark:bg-slate-900/50 dark:hover:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                  >
                    {/* Top line */}
                    <div className="flex justify-between items-start gap-4 pr-16">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-150 line-clamp-2">
                        {item.original}
                      </span>
                    </div>

                    {/* Urdu Translation */}
                    <div className="mt-2 text-right">
                      <span className="font-medium text-slate-900 dark:text-slate-50 font-sans text-sm" dir="rtl">
                        {item.translated}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 italic font-mono max-w-[150px] truncate">
                        "{item.transliteration}"
                      </span>

                      {/* Floating actions right */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {item.audioBase64 && (
                          <button
                            id={`play-cached-btn-${item.id}`}
                            onClick={(e) => onPlayCachedAudio(item, e)}
                            className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 transition-colors"
                            title="Play cached voice (Offline supported!)"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                        <button
                          id={`bookmark-item-btn-${item.id}`}
                          onClick={(e) => onToggleBookmark(item.id, e)}
                          className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-400 hover:text-amber-500 transition-colors"
                          title="Star translation"
                        >
                          <Bookmark
                            size={12}
                            className={item.bookmarked ? 'fill-amber-500 text-amber-500' : ''}
                          />
                        </button>
                        <button
                          id={`delete-item-btn-${item.id}`}
                          onClick={(e) => onDeleteHistoryItem(item.id, e)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Offline tip */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <Sparkles size={11} className="text-indigo-400" />
                <span>Starred items & voice recordings are fully cached offline</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
