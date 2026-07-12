import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  Volume2, 
  VolumeX,
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  RotateCcw, 
  Star, 
  ArrowRightLeft, 
  Menu, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Square,
  Network
} from 'lucide-react';

import { HistoryItem, TranslationResult, VoiceOption, PresetPhrase } from './types';
import { translateOffline, PRESET_PHRASES } from './utils/offlineDictionary';
import OfflineIndicator from './components/OfflineIndicator';
import PresetPhrases from './components/PresetPhrases';
import InteractiveDictionary from './components/InteractiveDictionary';
import HistorySidebar from './components/HistorySidebar';

export default function App() {
  // System Connection States
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [forceOffline, setForceOffline] = useState(false);

  // Translation States
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio / Speech Synthesis States
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore'); // Gemini Prebuilts
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [activePlaybackSource, setActivePlaybackSource] = useState<any>(null);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<boolean>(false);

  // Mic Speech-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Translation History & Starred Cache (Stored in local storage)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Micro-interactions (Copy confirmations)
  const [copiedUrdu, setCopiedUrdu] = useState(false);
  const [copiedRoman, setCopiedRoman] = useState(false);

  // PCM Web Audio Playback Ref to stop overlapping sounds
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load from local storage
    const savedHistory = localStorage.getItem('translation_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse translation history', e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync history to LocalStorage
  const saveHistoryToStorage = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('translation_history', JSON.stringify(newHistory));
  };

  // Check connection status considering force override
  const connectionActive = isOnline && !forceOffline;

  // Stop active speech playback if any
  const stopPlayback = () => {
    // 1. Stop PCM Web Audio
    if (audioSourceNodeRef.current) {
      try {
        audioSourceNodeRef.current.stop();
      } catch (e) {}
      audioSourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 2. Stop Browser SpeechSynthesis fallback
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setSpeechSynthesisActive(false);
  };

  // Perform Translation
  const handleTranslate = async (textToTranslate = inputText) => {
    const text = textToTranslate.trim();
    if (!text) return;

    setIsLoading(true);
    setError(null);
    stopPlayback();

    // Check if offline or simulating offline
    if (!connectionActive) {
      // 1. Local Fallback Translation
      setTimeout(() => {
        const localResult = translateOffline(text);
        setResult(localResult);
        addToHistory(localResult);
        setIsLoading(false);
      }, 350); // Simulate subtle transition delay
      return;
    }

    // 2. Online API Translation
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data: TranslationResult = await response.json();
      setResult(data);
      
      // Auto-fetch TTS audio in background to cache it for offline use if bookmarked later!
      let base64Audio = undefined;
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.translated, voice: selectedVoice }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          base64Audio = ttsData.audio;
        }
      } catch (ttsErr) {
        console.warn('Background TTS pre-fetch failed', ttsErr);
      }

      addToHistory(data, base64Audio);

    } catch (err: any) {
      console.error('Translation failed', err);
      setError(err.message || 'An error occurred during translation. Falling back to offline dictionary.');
      
      // Fallback instantly on error
      const localResult = translateOffline(text);
      setResult(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  // Add translated item to local history
  const addToHistory = (res: TranslationResult, audioBase64?: string) => {
    // Check if identical original already exists in history to avoid duplication
    const filtered = history.filter(
      (item) => item.original.toLowerCase() !== res.original.toLowerCase()
    );

    const newItem: HistoryItem = {
      ...res,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      bookmarked: false,
      audioBase64: audioBase64,
    };

    const updated = [newItem, ...filtered].slice(0, 50); // Limit to 50 items
    saveHistoryToStorage(updated);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.map((item) => {
      if (item.id === id) {
        return { ...item, bookmarked: !item.bookmarked };
      }
      return item;
    });
    saveHistoryToStorage(updated);
  };

  // Delete Individual History Item
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    saveHistoryToStorage(updated);
  };

  // Clear All History
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your translation history?')) {
      saveHistoryToStorage([]);
    }
  };

  // Select Preset/Quick-Access Phrase
  const handleSelectPreset = (phrase: PresetPhrase) => {
    setInputText(phrase.english);
    const convertedResult: TranslationResult = {
      original: phrase.english,
      translated: phrase.urdu,
      transliteration: phrase.romanUrdu,
      pronunciation: phrase.pronunciation,
      dictionary: [
        { word: phrase.english, type: 'phrase', translation: phrase.urdu, context: 'Quick access conversational phrase' }
      ],
      explanation: 'Quick-access conversational phrase. Fully available offline.',
    };
    setResult(convertedResult);
    addToHistory(convertedResult);
    stopPlayback();
  };

  // Select History Item
  const handleSelectHistory = (item: HistoryItem) => {
    setInputText(item.original);
    setResult({
      original: item.original,
      translated: item.translated,
      transliteration: item.transliteration,
      pronunciation: item.pronunciation,
      dictionary: item.dictionary,
      explanation: item.explanation,
    });
    setIsSidebarOpen(false);
    stopPlayback();
  };

  // Play Speech (Web Audio 24kHz PCM Decoder for Gemini TTS, or browser SpeechSynthesis fallback)
  const handlePlayVoice = async () => {
    if (!result) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);

    // 1. Check if we have pre-synthesized/cached audio on an existing history item
    const cachedItem = history.find(
      (h) => h.original.toLowerCase() === result.original.toLowerCase() && h.audioBase64
    );

    if (cachedItem && cachedItem.audioBase64) {
      playRawPCM(cachedItem.audioBase64);
      return;
    }

    // 2. Play using Online TTS API if connected
    if (connectionActive) {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: result.translated, voice: selectedVoice }),
        });

        if (!response.ok) throw new Error('TTS server failed');

        const data = await response.json();
        
        // Cache this base64 speech back into the history item
        const updatedHistory = history.map((item) => {
          if (item.original.toLowerCase() === result.original.toLowerCase()) {
            return { ...item, audioBase64: data.audio };
          }
          return item;
        });
        saveHistoryToStorage(updatedHistory);

        playRawPCM(data.audio);
        return;
      } catch (err) {
        console.warn('TTS API generation failed, falling back to local synthesis', err);
      }
    }

    // 3. Offline / Fallback Local Synthesis
    playLocalSynthesis(result.translated);
  };

  // Play Cached History Audio directly
  const handlePlayCachedAudio = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    stopPlayback();
    setIsPlaying(true);
    if (item.audioBase64) {
      playRawPCM(item.audioBase64);
    } else {
      playLocalSynthesis(item.translated);
    }
  };

  // Raw PCM little-endian 24kHz audio playback
  const playRawPCM = (base64Data: string) => {
    try {
      const sampleRate = 24000;
      const binary = atob(base64Data);
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new DataView(buffer);
      for (let i = 0; i < len; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }

      const numSamples = len / 2;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate });
      audioContextRef.current = audioCtx;

      const audioBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        channelData[i] = view.getInt16(i * 2, true) / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = voiceSpeed;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      audioSourceNodeRef.current = source;
      source.start(0);

    } catch (e) {
      console.error('PCM Web Audio playback failed', e);
      setIsPlaying(false);
    }
  };

  // Native Speech Synthesis Fallback (Completely Offline)
  const playLocalSynthesis = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsPlaying(false);
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    try {
      setSpeechSynthesisActive(true);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Find browser Urdu or similar voice (Google Hindi, Google Arabic, etc. often act as fallbacks if Urdu not installed)
      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(
        (v) => v.lang.startsWith('ur') || v.lang.startsWith('hi') || v.lang.includes('PK')
      );

      if (urduVoice) {
        utterance.voice = urduVoice;
      }
      
      utterance.rate = voiceSpeed;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setSpeechSynthesisActive(false);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error', e);
        setIsPlaying(false);
        setSpeechSynthesisActive(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Local speech synthesis failed', e);
      setIsPlaying(false);
      setSpeechSynthesisActive(false);
    }
  };

  // Web Speech Microphone Recording (English Speech-to-Text)
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText(transcript);
        handleTranslate(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Microphone error: ${event.error}. Please check permissions.`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (e) {
      console.error('Microphone recording setup failed', e);
      setIsRecording(false);
    }
  };

  // Clipboard Copiers
  const copyToClipboard = (text: string, type: 'urdu' | 'roman') => {
    navigator.clipboard.writeText(text);
    if (type === 'urdu') {
      setCopiedUrdu(true);
      setTimeout(() => setCopiedUrdu(false), 2000);
    } else {
      setCopiedRoman(true);
      setTimeout(() => setCopiedRoman(false), 2000);
    }
  };

  // Bookmark active translation
  const handleBookmarkActive = () => {
    if (!result) return;
    const existing = history.find((h) => h.original.toLowerCase() === result.original.toLowerCase());
    if (existing) {
      handleToggleBookmark(existing.id, { stopPropagation: () => {} } as any);
    }
  };

  const isActiveBookmarked = result 
    ? !!history.find((h) => h.original.toLowerCase() === result.original.toLowerCase() && h.bookmarked)
    : false;

  return (
    <div id="voice-studio-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-all">
      
      {/* Top Navigation bar */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            <Languages size={20} />
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
              <span>English</span>
              <span className="text-slate-400 font-normal">➔</span>
              <span>Urdu Voice Studio</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">Desktop Offline Companion</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          <OfflineIndicator 
            isOnline={isOnline}
            forceOffline={forceOffline}
            onToggleForceOffline={() => {
              setForceOffline(!forceOffline);
              stopPlayback();
            }}
          />

          <button
            id="open-history-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200/50 dark:border-slate-700/50"
          >
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="hidden sm:inline">Saved & History</span>
            {history.length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body (Bento Workspace) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Control Center (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Main Translate Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm hover:shadow transition-all relative overflow-hidden flex flex-col gap-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">English Input</span>
              
              <div className="flex items-center gap-1.5">
                {inputText && (
                  <button
                    id="clear-input-btn"
                    onClick={() => { setInputText(''); setResult(null); stopPlayback(); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Input Form area */}
            <form onSubmit={(e) => { e.preventDefault(); handleTranslate(); }} className="flex flex-col gap-3">
              <div className="relative">
                <textarea
                  id="english-text-input"
                  rows={4}
                  placeholder="Type or paste English words, phrases, or conversational sentences..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTranslate();
                    }
                  }}
                  className="w-full text-sm bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />

                {/* Mic Float Button */}
                <button
                  id="mic-dictation-btn"
                  type="button"
                  onClick={handleToggleRecord}
                  className={`absolute bottom-4 right-4 p-2.5 rounded-full shadow-md transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 dark:bg-slate-850 dark:text-indigo-400 dark:border-slate-700'
                  }`}
                  title={isRecording ? 'Click to stop dictation' : 'Click to dictate English via Microphone'}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Character check & submit */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  {inputText.length} characters
                </span>

                <button
                  id="submit-translate-btn"
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all ${
                    !inputText.trim()
                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-850 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none'
                  }`}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Translate</span>
                      <ChevronRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="text-[11px] text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 p-3 rounded-xl leading-relaxed">
                {error}
              </div>
            )}
          </div>

          {/* Quick Preset Phrases Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm">
            <PresetPhrases onSelectPhrase={handleSelectPreset} />
          </div>

        </div>

        {/* RIGHT COLUMN: Output Panel (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Main Translation Output Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between gap-6 transition-all">
            
            {/* Output header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urdu translation</span>
                {!connectionActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 uppercase border border-amber-100 dark:border-amber-900">
                    Offline matching
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-1">
                  <button
                    id="star-active-btn"
                    onClick={handleBookmarkActive}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActiveBookmarked
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Star translation"
                  >
                    <Star size={16} className={isActiveBookmarked ? 'fill-amber-500' : ''} />
                  </button>
                  <button
                    id="copy-urdu-btn"
                    onClick={() => copyToClipboard(result.translated, 'urdu')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Urdu text"
                  >
                    {copiedUrdu ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* Output Display container */}
            <div className="flex-1 flex flex-col justify-center py-6 min-h-[140px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">Synthesizing translations...</span>
                </div>
              ) : result ? (
                <div className="flex flex-col gap-5 text-right w-full" dir="rtl">
                  {/* Urdu script */}
                  <h2 className="urdu-script text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 leading-relaxed tracking-wide select-all text-right">
                    {result.translated}
                  </h2>

                  {/* Roman Script transliteration left aligned */}
                  <div className="text-left border-t border-slate-100 dark:border-slate-800 pt-4" dir="ltr">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Roman Transliteration</span>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 select-all leading-normal italic">
                          "{result.transliteration}"
                        </p>
                      </div>
                      <button
                        id="copy-transliteration-btn"
                        onClick={() => copyToClipboard(result.transliteration, 'roman')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850"
                        title="Copy Roman Transliteration"
                      >
                        {copiedRoman ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Pronunciation guide */}
                  <div className="text-left bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800" dir="ltr">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">How to Pronounce (Phonetics)</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono tracking-wide leading-relaxed">
                      {result.pronunciation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-4">
                  <Languages size={42} className="stroke-1 mb-3 opacity-50" />
                  <p className="text-sm font-semibold">Ready for translation</p>
                  <p className="text-xs opacity-80 mt-1 max-w-sm">Enter English text or select one of our curated conversational presets to generate Urdu Voice speech</p>
                </div>
              )}
            </div>

            {/* Dynamic Voice Player & Controls */}
            {result && (
              <div 
                id="voice-studio-player-panel"
                className="bg-indigo-50/50 dark:bg-slate-950/40 border border-indigo-100/30 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between"
              >
                {/* Play action */}
                <div className="flex items-center gap-3">
                  <button
                    id="listen-tts-btn"
                    onClick={handlePlayVoice}
                    className={`h-11 w-11 rounded-full flex items-center justify-center text-white shadow-sm transition-all ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                    }`}
                    title={isPlaying ? 'Stop Voice playback' : 'Play Voice in natural Urdu accent'}
                  >
                    {isPlaying ? <Square size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                  </button>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {isPlaying ? 'Speaking Urdu' : 'Listen with Voice'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {speechSynthesisActive ? 'Device Local voice (Offline)' : `${selectedVoice} AI Accent Voice`}
                    </span>
                  </div>
                </div>

                {/* Waveform Equalizer animation when playing */}
                <div className="h-6 flex items-end gap-1 px-3">
                  {[1, 2, 3, 4, 5, 6].map((bar) => (
                    <span
                      key={bar}
                      className={`w-0.5 rounded-full bg-indigo-500/80 transition-all ${
                        isPlaying ? 'animate-bounce' : 'h-1'
                      }`}
                      style={{
                        animationDuration: isPlaying ? `${0.4 + bar * 0.1}s` : '0s',
                        height: isPlaying ? undefined : '4px',
                        animationDelay: `${bar * 0.05}s`
                      }}
                    />
                  ))}
                </div>

                {/* Configuration controls */}
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                  {/* Voice accent selection (Hidden if fully offline) */}
                  {connectionActive && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Accent Voice</label>
                      <select
                        id="ai-voice-select"
                        value={selectedVoice}
                        onChange={(e) => {
                          setSelectedVoice(e.target.value);
                          stopPlayback();
                        }}
                        className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                      >
                        <option value="Kore">Kore (Balanced Accent)</option>
                        <option value="Puck">Puck (Cheerful Tone)</option>
                        <option value="Zephyr">Zephyr (Deep Male Voice)</option>
                        <option value="Fenrir">Fenrir (Classic Academic)</option>
                        <option value="Charon">Charon (Whisper/Soft)</option>
                      </select>
                    </div>
                  )}

                  {/* Playback speed rate */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Speed</label>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">{voiceSpeed}x</span>
                    </div>
                    <input
                      id="voice-speed-slider"
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.25"
                      value={voiceSpeed}
                      onChange={(e) => {
                        setVoiceSpeed(parseFloat(e.target.value));
                        // If playing browser synthesis, cancel and restart
                        if (isPlaying && speechSynthesisActive) {
                          stopPlayback();
                          setTimeout(() => handlePlayVoice(), 50);
                        }
                      }}
                      className="w-24 accent-indigo-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Interactive dictionary vocabulary breakdown */}
          {result && result.dictionary.length > 0 && (
            <InteractiveDictionary 
              words={result.dictionary} 
              explanation={result.explanation}
            />
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          English to Urdu Voice Studio • Designed with durable offline capabilities • Powered by Google Gemini AI
        </p>
      </footer>

      {/* History Sidebar drawer */}
      <HistorySidebar
        history={history}
        onSelectHistoryItem={handleSelectHistory}
        onToggleBookmark={handleToggleBookmark}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onPlayCachedAudio={handlePlayCachedAudio}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

    </div>
  );
}
