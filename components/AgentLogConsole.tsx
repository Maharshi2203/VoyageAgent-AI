import React from 'react';
import { AgentLog } from '../types';
import { Terminal, CheckCircle, AlertTriangle, Loader2, Cpu } from 'lucide-react';

interface Props {
  logs: AgentLog[];
}

const AgentLogConsole: React.FC<Props> = ({ logs }) => {
  return (
    <div className="bg-space-main rounded-[2.5rem] overflow-hidden shadow-2xl border border-space-border h-[480px] flex flex-col relative transition-all duration-300">
      <div className="bg-space-secondary px-8 py-5 border-b border-space-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-glow animate-pulse shadow-lg"></div>
          <span className="text-typo-secondary font-black text-[11px] uppercase tracking-[0.4em]">Autonomous Feed</span>
        </div>
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-typo-muted/20"></div>
          <div className="w-2 h-2 rounded-full bg-typo-muted/20"></div>
          <div className="w-2 h-2 rounded-full bg-typo-muted/20"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 font-mono custom-scrollbar bg-space-main/30">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-typo-muted/20 text-center space-y-6">
            <Cpu size={48} />
            <p className="text-[11px] uppercase tracking-[0.3em] font-black">Neural core standby. Awaiting signals...</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-left-6 duration-600">
            <div className="flex items-start gap-5">
              <span className="text-typo-muted text-[10px] mt-1.5 shrink-0 font-bold opacity-50">
                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border 
                    ${log.status === 'success' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' : 
                      log.status === 'warning' ? 'bg-amber-400/10 text-amber-500 border-amber-400/30' :
                      log.status === 'info' ? 'bg-brand-tech/10 text-brand-tech border-brand-tech/30' :
                      'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                    {log.step}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed font-bold ${log.status === 'error' ? 'text-red-500' : 'text-typo-primary/90'}`}>
                  {log.message}
                </p>
                {log.reasoning && (
                  <div className="mt-4 pl-5 border-l-2 border-brand-glow/30 text-typo-muted text-[11px] leading-relaxed italic bg-space-secondary/30 py-3 rounded-r-xl">
                    LOGIC_CHAIN: {log.reasoning}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {logs.length > 0 && logs[logs.length-1].status === 'info' && (
          <div className="flex items-center gap-4 text-brand-glow/50 ml-16">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Processing Vector...</span>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--space-border);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AgentLogConsole;