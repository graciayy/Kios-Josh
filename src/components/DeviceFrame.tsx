import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, ArrowLeft } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  role: 'customer' | 'admin';
  onSwitchRole?: () => void;
}

export default function DeviceFrame({ children, title, onBack, role, onSwitchRole }: DeviceFrameProps) {
  const [time, setTime] = useState('08:53');

  useEffect(() => {
    // Standardize to current hour or interactive time if desired, let's show real time
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[412px] h-[840px] bg-[#F9F4E8] rounded-[48px] border-[12px] border-neutral shadow-2xl overflow-hidden flex flex-col select-none ring-4 ring-primary/10">
      {/* Notch / Camera Bar */}
      <div className="absolute top-0 inset-x-0 h-6 bg-neutral/95 flex justify-between items-center px-6 z-50 text-white text-[10px] font-mono">
        <span>{time}</span>
        <div className="w-16 h-4 bg-black rounded-b-md absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-[#171717] rounded-full border border-neutral-800"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-white/90" strokeWidth={2.5} />
          <Wifi className="w-3.5 h-3.5 text-white/90" strokeWidth={2.5} />
          <Battery className="w-3.5 h-3.5 text-white/90 rotate-90" strokeWidth={2.5} />
        </div>
      </div>

      {/* Role Ribbon/Badge */}
      <div className="absolute top-6 inset-x-0 h-8 bg-primary text-white flex justify-between items-center px-4 z-40 text-xs font-semibold uppercase tracking-wider shadow">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
          Kios Josh • {role === 'admin' ? 'ADMIN PANEL' : 'CUSTOMER'}
        </span>
        {onSwitchRole && (
          <button 
            onClick={onSwitchRole} 
            className="bg-white/10 hover:bg-white/25 active:scale-95 text-[10px] px-2 py-0.5 rounded border border-white/20 transition-all font-sans cursor-pointer"
          >
            Tukar HP
          </button>
        )}
      </div>

      {/* Application Main Content Area */}
      <div className="flex-1 mt-14 overflow-y-auto bg-[#F9F4E8] flex flex-col relative">
        {children}
      </div>

      {/* Android Style Navigation Pills */}
      <div className="h-10 bg-[#F9F4E8] border-t border-primary/5 flex items-center justify-center gap-20 pb-2.5 pt-1.5 z-40">
        <button className="w-4 h-4 rounded-sm border-2 border-primary/30 rotate-45 hover:border-primary transition" aria-label="Back"></button>
        <button className="w-4 h-4 rounded-full border-2 border-primary/30 hover:border-primary transition" aria-label="Home"></button>
        <button className="w-4 h-4 rounded-[3px] border-2 border-primary/30 hover:border-primary transition" aria-label="Tabs"></button>
      </div>
    </div>
  );
}
