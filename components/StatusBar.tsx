
import React from 'react';

interface StatusBarProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, value, color, icon }) => {
  return (
    <div className="flex flex-col gap-1 w-full group">
      <div className="flex justify-between items-center text-[10px] font-orbitron uppercase tracking-widest px-1">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className={`${color} font-bold`}>{value}%</span>
      </div>
      <div className="h-3 bg-slate-900 border border-slate-800 rounded-sm overflow-hidden p-[2px]">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.3)]`}
          style={{ 
            width: `${value}%`, 
            backgroundColor: color === 'text-cyan-400' ? '#22d3ee' : color === 'text-emerald-400' ? '#34d399' : color === 'text-amber-400' ? '#fbbf24' : '#f87171' 
          }}
        />
      </div>
    </div>
  );
};
