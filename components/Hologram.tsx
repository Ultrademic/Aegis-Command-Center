
import React from 'react';
import { ViewMode } from '../types';

interface HologramProps {
  themeColor: string;
  viewMode: ViewMode;
  hullIntegrity: number;
}

export const Hologram: React.FC<HologramProps> = ({ themeColor, viewMode, hullIntegrity }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-8">
      {/* Holographic Base */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-800 rounded-full blur-sm opacity-50" />
      
      {viewMode === 'SYSTEM' ? (
        <div className={`relative w-3/4 h-3/4 rounded-full border border-${themeColor}-400/20 overflow-hidden shadow-[inset_0_0_50px_rgba(34,211,238,0.2)] animate-pulse`}>
          {/* Atmosphere Glow */}
          <div className={`absolute inset-0 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-${themeColor}-400/40`} />
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`absolute top-1/2 left-1/2 w-full h-[1px] bg-${themeColor}-400`}
                style={{ 
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  boxShadow: `0 0 10px rgba(34, 211, 238, 0.5)`
                }}
              />
            ))}
          </div>
          <div className={`absolute left-0 right-0 h-[2px] bg-${themeColor}-400/60 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_3s_ease-in-out_infinite]`} style={{ top: '0%' }} />
        </div>
      ) : (
        /* Ship Wireframe View */
        <div className="relative w-full h-full flex items-center justify-center p-4 scale-110">
           <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]`}>
             {/* Simple Ship Wireframe */}
             <path 
               d="M50,10 L80,40 L80,80 L20,80 L20,40 Z" 
               fill="none" 
               stroke={`currentColor`} 
               strokeWidth="0.5" 
               className={`${themeColor === 'cyan' ? 'text-cyan-400' : themeColor === 'red' ? 'text-red-400' : 'text-emerald-400'} opacity-80`}
             />
             <path d="M20,60 L80,60 M50,10 L50,80" stroke="currentColor" strokeWidth="0.2" className="opacity-40" />
             
             {/* Engine Points */}
             <circle cx="35" cy="80" r="2" className={`${themeColor === 'cyan' ? 'fill-cyan-400' : 'fill-red-400'} animate-pulse`} />
             <circle cx="65" cy="80" r="2" className={`${themeColor === 'cyan' ? 'fill-cyan-400' : 'fill-red-400'} animate-pulse`} />

             {/* Hull Breach Markers (Dynamic) */}
             {hullIntegrity < 80 && (
               <g className="text-red-500">
                  <path d="M25,50 L35,55" stroke="currentColor" strokeWidth="2" />
                  <circle cx="25" cy="50" r="1" fill="currentColor" />
               </g>
             )}
             {hullIntegrity < 50 && (
               <g className="text-red-500">
                  <path d="M70,70 L80,75" stroke="currentColor" strokeWidth="2" />
                  <circle cx="75" cy="72" r="1.5" fill="currentColor" />
               </g>
             )}
           </svg>
           {/* Scanline overlay for ship */}
           <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-${themeColor}-400/10 to-transparent h-1/4 w-full animate-[sweep_2s_linear_infinite]`} />
        </div>
      )}

      {/* Outer Rings */}
      <div className={`absolute w-full h-full border border-${themeColor}-400/10 rounded-full animate-[spin_20s_linear_infinite]`} />
      <div className={`absolute w-[90%] h-[90%] border-t-2 border-l-2 border-${themeColor}-400/20 rounded-full animate-[spin_12s_linear_infinite_reverse]`} />
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes sweep {
          0% { top: -25%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
