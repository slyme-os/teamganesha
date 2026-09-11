'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Bell } from 'lucide-react';
import { audioEngine } from '../lib/audio';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!isPlaying) {
      audioEngine.playTempleBell();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleRingBell = () => {
    audioEngine.playTempleBell();
  };

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-4 z-30 flex items-center space-x-2">
      {/* Floating Audio Bar */}
      <div className="glass-panel-gold rounded-full px-3 py-1.5 border border-ganesha-gold/40 flex items-center space-x-2 shadow-xl">
        <button
          onClick={togglePlay}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            isPlaying
              ? 'bg-ganesha-gold text-slate-950 animate-pulse'
              : 'bg-slate-900 text-ganesha-gold border border-ganesha-gold/30'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
        </button>

        <div className="hidden xs:block text-[10px] text-gray-300 pr-1">
          <span className="font-bold text-ganesha-gold block">Aarti Ambiance</span>
          <span className="text-[9px] text-gray-400">Sukh Karta Dukh Harta</span>
        </div>

        <button
          onClick={handleRingBell}
          title="Ring Temple Bell"
          className="p-1 rounded-full text-ganesha-gold hover:bg-ganesha-gold/20 transition-all"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="p-1 rounded-full text-gray-400 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-ganesha-gold" />}
        </button>
      </div>
    </div>
  );
};
