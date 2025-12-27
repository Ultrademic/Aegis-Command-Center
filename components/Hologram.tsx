
import React from 'react';

export const Hologram: React.FC<{ themeColor: string }> = ({ themeColor }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-8">
      {/* Holographic Base */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-800 rounded-full blur-sm opacity-50" />
      
      {/* The Planet */}
      <div className={`relative w-3/4 h-3/4 rounded-full border border-${themeColor}-400/20 overflow-hidden shadow-[inset_0_0_50px_rgba(34,211,238,0.2)] animate-pulse`}>
        {/* Atmosphere Glow */}
        <div className={`absolute inset-0 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-${themeColor}-400/40`} />
        
        {/* Spinning Surface Lines */}
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

        {/* Dynamic Scanning Line */}
        <div className={`absolute left-0 right-0 h-[2px] bg-${themeColor}-400/60 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_3s_ease-in-out_infinite]`} style={{ top: '0%' }} />
      </div>

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
      `}</style>
    </div>
  );
};
