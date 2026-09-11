'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Compass, Bell } from 'lucide-react';
import { audioEngine } from '../lib/audio';

interface NavbarProps {
  onOpen360View: (pandalId?: string) => void;
  onOpenDonation: (pandalId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpen360View }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [bellRung, setBellRung] = useState(false);

  const handleToggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleRingBell = () => {
    audioEngine.playTempleBell();
    setBellRung(true);
    setTimeout(() => setBellRung(false), 500);
  };

  const handleSoundShankh = () => {
    audioEngine.playShankh();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel-gold border-b border-ganesha-gold/20 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-ganesha-saffron to-ganesha-gold flex items-center justify-center shadow-md shadow-ganesha-saffron/30">
            <span className="text-xl font-bold text-white leading-none">ॐ</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-ganesha-emerald rounded-full border-2 border-ganesha-dark pulse-dot" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
                Deva<span className="text-gold-gradient">Darshan</span>
              </h1>
              <span className="bg-ganesha-saffron/20 text-ganesha-saffron border border-ganesha-saffron/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                360 PWA
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">
              Live Mumbai Ganpati Darshan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Temple Bell Trigger */}
          <button
            onClick={handleRingBell}
            title="Ring Temple Bell (Ghanti)"
            className={`p-2 rounded-xl glass-panel border border-ganesha-gold/30 text-ganesha-gold hover:bg-ganesha-gold/20 active:scale-95 transition-all ${
              bellRung ? 'scale-110 bg-ganesha-gold/30 text-white' : ''
            }`}
          >
            <Bell className={`w-4 h-4 ${bellRung ? 'animate-bounce' : ''}`} />
          </button>

          {/* Shankh Trigger */}
          <button
            onClick={handleSoundShankh}
            title="Sound Shankh (Conch)"
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl glass-panel border border-ganesha-saffron/40 text-ganesha-saffron hover:bg-ganesha-saffron/20 active:scale-95 text-xs font-semibold transition-all"
          >
            <span>🐚</span>
            <span>Shankh</span>
          </button>

          {/* Mute Audio Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-xl glass-panel border border-white/10 text-gray-300 hover:text-white hover:border-ganesha-gold/40 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-ganesha-gold" />}
          </button>

          {/* 360 Virtual Darshan Launch Button */}
          <button
            onClick={() => onOpen360View('lalbaugcha-raja')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-ganesha-saffron/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span className="hidden xs:inline">360° Darshan</span>
            <Sparkles className="w-3 h-3 text-slate-900" />
          </button>
        </div>
      </div>
    </header>
  );
};
