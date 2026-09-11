'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Pandal } from '../lib/types';

interface PanoramaViewerProps {
  initialPandalId?: string;
  onClose: () => void;
  onOpenDonation: (pandal: Pandal) => void;
}

const PanoramaSkeleton: React.FC = () => (
  <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center space-y-4 animate-pulse p-4 text-center">
    <div className="w-16 h-16 rounded-full bg-ganesha-gold/20 border-2 border-ganesha-gold flex items-center justify-center text-ganesha-gold shadow-lg shadow-ganesha-gold/20">
      <Compass className="w-8 h-8 animate-spin" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-bold text-white flex items-center justify-center space-x-1.5">
        <span>Initializing 360° WebGL View</span>
        <Sparkles className="w-4 h-4 text-ganesha-gold" />
      </h3>
      <p className="text-xs text-gray-400 max-w-xs">
        Loading high-resolution equirectangular panorama texture...
      </p>
    </div>
  </div>
);

export const DynamicPanoramaViewer = dynamic<PanoramaViewerProps>(
  () => import('./PanoramaViewer').then((mod) => mod.PanoramaViewer),
  {
    ssr: false,
    loading: () => <PanoramaSkeleton />,
  }
);
