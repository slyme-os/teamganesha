'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Pandal } from '../lib/types';
import { Compass, HeartHandshake, Clock, MapPin, ChevronDown, ChevronUp, Eye, CheckCircle2 } from 'lucide-react';

interface PandalCardProps {
  pandal: Pandal;
  onOpen360: (pandalId: string) => void;
  onOpenDonation: (pandal: Pandal) => void;
  onOpenCrowdReport: (pandal: Pandal) => void;
}

export const PandalCard: React.FC<PandalCardProps> = ({
  pandal,
  onOpen360,
  onOpenDonation,
  onOpenCrowdReport,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [pranams, setPranams] = useState<number>(pandal.totalPranams);
  const [hasBlessed, setHasBlessed] = useState(false);

  const handlePranam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasBlessed) {
      setPranams((prev: number) => prev + 1);
      setHasBlessed(true);
    }
  };

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case 'low':
        return (
          <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span>Low Queue (~{pandal.waitTimeMinutes}m)</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-dot" />
            <span>Moderate (~{pandal.waitTimeMinutes}m)</span>
          </span>
        );
      case 'high':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span>Heavy Queue (~{Math.round(pandal.waitTimeMinutes / 60 * 10) / 10}h)</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel gold-glow-card rounded-2xl overflow-hidden border border-ganesha-border flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Card Header & Thumbnail */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden group cursor-pointer" onClick={() => onOpen360(pandal.id)}>
          <Image
            src={pandal.thumbnailImage}
            alt={pandal.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {getCrowdBadge(pandal.crowdLevel)}

            <span className="bg-slate-900/80 backdrop-blur-md text-gray-300 border border-white/10 text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-ganesha-saffron" />
              <span>{pandal.distanceKm} km away</span>
            </span>
          </div>

          {/* Center 360 Play Overlay Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-ganesha-saffron/90 text-white flex items-center justify-center shadow-lg shadow-ganesha-saffron/50 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Bottom Overlay Title & Views */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-ganesha-gold">
                {pandal.area}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {pandal.name}
              </h2>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
              <Eye className="w-3 h-3 text-ganesha-gold" />
              <span>{(pandal.totalViews / 1000).toFixed(0)}k views</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-300 line-clamp-2">
            {pandal.tagline}
          </p>

          {/* UPI Verified Badge */}
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-semibold">Direct Mandal UPI Verified</span>
            <span className="text-gray-400 text-[10px] ml-auto">0% Fee</span>
          </div>

          {/* Expandable History & Aarti Details */}
          {showDetails && (
            <div className="pt-2 text-xs text-gray-300 space-y-2 border-t border-white/10 animate-fadeIn">
              <div>
                <span className="font-semibold text-ganesha-gold">Mandal History:</span>
                <p className="text-gray-400 text-[11px] mt-0.5">{pandal.history}</p>
              </div>
              <div>
                <span className="font-semibold text-ganesha-gold flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Aarti Timings:</span>
                </span>
                <ul className="list-disc list-inside text-gray-400 text-[11px] mt-1 space-y-0.5">
                  {pandal.aartiTimings.map((time: string, idx: number) => (
                    <li key={idx}>{time}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[11px] text-gray-400">
                <span className="font-semibold text-gray-300">UPI ID: </span>
                <code className="text-ganesha-gold bg-black/40 px-1.5 py-0.5 rounded">{pandal.upiDetails.vpa}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-[11px] text-gray-400 hover:text-ganesha-gold flex items-center justify-center space-x-1 py-0.5"
        >
          <span>{showDetails ? 'Hide Details' : 'View Aarti Timings & History'}</span>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* 360 Darshan Trigger */}
          <button
            onClick={() => onOpen360(pandal.id)}
            className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>360° Darshan</span>
          </button>

          {/* Direct Donation Trigger */}
          <button
            onClick={() => onOpenDonation(pandal)}
            className="flex items-center justify-center space-x-1.5 glass-panel border border-ganesha-gold/40 text-ganesha-gold font-bold py-2.5 px-3 rounded-xl text-xs hover:bg-ganesha-gold/20 active:scale-95 transition-all"
          >
            <HeartHandshake className="w-4 h-4 text-ganesha-saffron" />
            <span>Donate UPI</span>
          </button>
        </div>

        {/* Bottom Pranam blessing & crowd update button */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={handlePranam}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
              hasBlessed
                ? 'bg-ganesha-gold/20 border-ganesha-gold text-ganesha-gold'
                : 'border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>🙏</span>
            <span>{hasBlessed ? 'Pranam Sent' : 'Send Pranam'}</span>
            <span className="text-[10px] text-gray-500">({pranams.toLocaleString()})</span>
          </button>

          <button
            onClick={() => onOpenCrowdReport(pandal)}
            className="text-[11px] text-ganesha-saffron hover:underline font-semibold"
          >
            Report Live Crowd
          </button>
        </div>
      </div>
    </div>
  );
};
