import { Wifi, WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  forceOffline: boolean;
  onToggleForceOffline: () => void;
}

export default function OfflineIndicator({
  isOnline,
  forceOffline,
  onToggleForceOffline,
}: OfflineIndicatorProps) {
  const activeOnline = isOnline && !forceOffline;

  return (
    <div 
      id="offline-indicator-wrapper"
      className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {activeOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </>
          )}
        </span>
        
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {activeOnline ? 'AI Connected' : 'Local Offline Mode'}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

      <button
        id="force-offline-btn"
        type="button"
        onClick={onToggleForceOffline}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          forceOffline
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
            : 'bg-slate-200/60 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
        }`}
        title={forceOffline ? 'Click to reconnect AI' : 'Click to test offline capabilities'}
      >
        {forceOffline ? (
          <>
            <WifiOff size={13} />
            <span>Forced Offline</span>
          </>
        ) : (
          <>
            <Wifi size={13} />
            <span>Simulate Offline</span>
          </>
        )}
      </button>
    </div>
  );
}
