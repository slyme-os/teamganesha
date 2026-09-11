'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNav, NavTab } from '../components/BottomNav';
import { PandalCard } from '../components/PandalCard';
import { DynamicPanoramaViewer } from '../components/DynamicPanoramaViewer';
import { DonationModal } from '../components/DonationModal';
import { CrowdStatusModal } from '../components/CrowdStatusModal';
import { CommunityGallery } from '../components/CommunityGallery';
import { AudioPlayer } from '../components/AudioPlayer';
import { PANDALS_DATA } from '../lib/data/pandals';
import { Pandal, CrowdLevel } from '../lib/types';
import { sanitizeSearchQuery } from '../lib/security/sanitize';
import {
  Search,
  Sparkles,
  Flame,
  Users,
  HeartHandshake,
  Navigation,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [pandals, setPandals] = useState<Pandal[]>(PANDALS_DATA);
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Modal states
  const [active360PandalId, setActive360PandalId] = useState<string | null>(null);
  const [donationPandal, setDonationPandal] = useState<Pandal | null>(null);
  const [crowdReportPandal, setCrowdReportPandal] = useState<Pandal | null>(null);

  // User location calculation trigger
  const [userLocStatus, setUserLocStatus] = useState<string>('Central Mumbai');

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setUserLocStatus('Locating...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocStatus('Near Dadar / Parel');
          setPandals(prev =>
            prev.map(p => {
              const dLat = (p.coordinates.lat - latitude) * 111;
              const dLng = (p.coordinates.lng - longitude) * 111;
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);
              return { ...p, distanceKm: Math.round(dist * 10) / 10 };
            })
          );
        },
        () => {
          setUserLocStatus('Mumbai Central');
        }
      );
    }
  };

  const handleReportSubmitted = (pandalId: string, level: CrowdLevel, waitMinutes: number) => {
    setPandals(prev =>
      prev.map(p =>
        p.id === pandalId
          ? { ...p, crowdLevel: level, waitTimeMinutes: waitMinutes }
          : p
      )
    );
  };

  // Filtered & Sanitized Pandals
  const filteredPandals = useMemo(() => {
    const cleanQuery = sanitizeSearchQuery(rawSearchQuery);
    return pandals.filter(pandal => {
      const matchesSearch =
        pandal.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        pandal.area.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        pandal.location.toLowerCase().includes(cleanQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'popular') return pandal.isPopular;
      if (selectedFilter === 'low-crowd') return pandal.crowdLevel === 'low';
      if (selectedFilter === 'south') return pandal.area.includes('South');
      if (selectedFilter === 'central') return pandal.area.includes('Central');
      if (selectedFilter === 'suburbs') return pandal.area.includes('Suburbs');

      return true;
    });
  }, [pandals, rawSearchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-ganesha-dark flex flex-col justify-between">
      {/* Top App Navbar */}
      <Navbar
        onOpen360View={(id) => setActive360PandalId(id || 'lalbaugcha-raja')}
        onOpenDonation={(id) => {
          const target = pandals.find(p => p.id === id) || pandals[0];
          setDonationPandal(target);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 space-y-6">
        {activeTab === 'gallery' ? (
          <CommunityGallery />
        ) : activeTab === 'crowd' ? (
          <div className="space-y-4 animate-fadeIn pb-16 sm:pb-6">
            <div className="glass-panel p-5 rounded-3xl border border-ganesha-gold/30 space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-ganesha-saffron" />
                <h2 className="text-lg font-bold text-white">Live Crowd Density Radar</h2>
              </div>
              <p className="text-xs text-gray-300">
                Real-time queue wait times updated by devotees on the ground across Mumbai.
              </p>

              <div className="space-y-3 pt-2">
                {pandals.map(pandal => (
                  <div
                    key={pandal.id}
                    className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border border-white/10"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{pandal.name}</h4>
                      <span className="text-[11px] text-gray-400">{pandal.area} • {pandal.distanceKm} km away</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className={`text-xs font-bold block ${
                          pandal.crowdLevel === 'low' ? 'text-emerald-400' : pandal.crowdLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {pandal.crowdLevel.toUpperCase()} CROWD
                        </span>
                        <span className="text-[11px] text-gray-300 font-medium">
                          ~{pandal.waitTimeMinutes} mins wait
                        </span>
                      </div>

                      <button
                        onClick={() => setCrowdReportPandal(pandal)}
                        className="bg-ganesha-gold/20 text-ganesha-gold border border-ganesha-gold/40 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-ganesha-gold hover:text-slate-950 transition-all"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'donate' ? (
          <div className="space-y-4 animate-fadeIn pb-16 sm:pb-6">
            <div className="glass-panel-gold p-6 rounded-3xl border border-ganesha-gold/40 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-ganesha-gold/20 text-ganesha-gold flex items-center justify-center mx-auto text-2xl font-bold">
                <HeartHandshake className="w-8 h-8 text-ganesha-gold" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Direct 0%-Fee Mandal Donation</h2>
                <p className="text-xs text-gray-300 max-w-md mx-auto mt-1">
                  100% of your donation is transferred directly via verified bank UPI VPAs directly into official mandal bank accounts. No platform fee or middleman cuts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left pt-3">
                {pandals.map(pandal => (
                  <div
                    key={pandal.id}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-ganesha-gold uppercase tracking-wider">{pandal.area}</span>
                      <h3 className="text-sm font-bold text-white">{pandal.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-1 font-mono">{pandal.upiDetails.vpa}</p>
                    </div>

                    <button
                      onClick={() => setDonationPandal(pandal)}
                      className="mt-3 w-full bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold py-2 rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      Donate Directly UPI
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Default Pandals Dashboard (Home & 360 Tab) */
          <>
            {/* Hero Banner & Live Aarti Ticker */}
            <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-ganesha-gold/30 p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-ganesha-saffron/20 text-ganesha-saffron border border-ganesha-saffron/40 px-3 py-1 rounded-full text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-ganesha-saffron animate-pulse" />
                  <span>Live Ganeshotsav 360 Platform</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Experience Virtual <span className="text-saffron-gradient">Ganpati Darshan</span> in 360°
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Immerse yourself in high-res 360° panoramas of Mumbai&apos;s most revered mandals, check live crowd queue status, and donate 0% fee directly via UPI.
                </p>

                {/* Geolocation Bar */}
                <div className="flex items-center space-x-2 pt-2 text-xs">
                  <button
                    onClick={handleGetLocation}
                    className="flex items-center space-x-1 bg-slate-950/80 border border-ganesha-gold/30 text-ganesha-gold px-3 py-1.5 rounded-xl font-medium hover:bg-ganesha-gold/20 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>User Location: {userLocStatus}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar & Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search mandal by name (Lalbaug, GSB, Chintamani...)"
                    value={rawSearchQuery}
                    onChange={(e) => setRawSearchQuery(e.target.value)}
                    maxLength={100}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ganesha-gold transition-all"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Pandals' },
                  { id: 'popular', label: '🔥 Top Famous' },
                  { id: 'low-crowd', label: '🟢 Low Queue' },
                  { id: 'central', label: 'Central Mumbai' },
                  { id: 'south', label: 'South Mumbai' },
                  { id: 'suburbs', label: 'Western Suburbs' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedFilter === filter.id
                        ? 'bg-ganesha-gold text-slate-950 border-ganesha-gold shadow-md'
                        : 'glass-panel text-gray-300 border-white/10 hover:border-ganesha-gold/40'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pandals Grid */}
            <div className="space-y-3 pb-16 sm:pb-6">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold">Showing {filteredPandals.length} Mumbai Pandals</span>
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-ganesha-gold" />
                  <span>360° Touch & Gyro Panning</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPandals.map((pandal) => (
                  <PandalCard
                    key={pandal.id}
                    pandal={pandal}
                    onOpen360={(id) => setActive360PandalId(id)}
                    onOpenDonation={(p) => setDonationPandal(p)}
                    onOpenCrowdReport={(p) => setCrowdReportPandal(p)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Audio Player */}
      <AudioPlayer />

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Overlays - Lazy Loaded Dynamic 360 Viewer */}
      {active360PandalId && (
        <DynamicPanoramaViewer
          initialPandalId={active360PandalId}
          onClose={() => setActive360PandalId(null)}
          onOpenDonation={(pandal) => {
            setActive360PandalId(null);
            setDonationPandal(pandal);
          }}
        />
      )}

      {donationPandal && (
        <DonationModal
          pandal={donationPandal}
          onClose={() => setDonationPandal(null)}
        />
      )}

      {crowdReportPandal && (
        <CrowdStatusModal
          pandal={crowdReportPandal}
          onClose={() => setCrowdReportPandal(null)}
          onReportSubmitted={handleReportSubmitted}
        />
      )}
    </div>
  );
}
