'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PhotoFeedItem } from '../lib/types';
import { PANDALS_DATA } from '../lib/data/pandals';
import { pandalService } from '../lib/services/pandalService';
import { sanitizeString } from '../lib/security/sanitize';
import { Image as ImageIcon, Plus, Send, X } from 'lucide-react';
import { audioEngine } from '../lib/audio';

export const CommunityGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoFeedItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPandalId, setSelectedPandalId] = useState<string>(PANDALS_DATA[0].id);
  const [userName, setUserName] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/pandals/lalbaug_360.png');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const data = await pandalService.getPhotoFeed();
    setPhotos(data);
  };

  const handlePranam = (photoId: string) => {
    audioEngine.playTempleBell();
    pandalService.incrementPranam(photoId);
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, pranams: p.pranams + 1 } : p))
    );
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pandal = PANDALS_DATA.find(p => p.id === selectedPandalId) || PANDALS_DATA[0];

    const cleanUserName = sanitizeString(userName, 50) || 'Devotee';
    const cleanCaption = sanitizeString(caption, 200) || 'Bappa Morya! 🙏';

    await pandalService.submitPhoto({
      pandalId: pandal.id,
      pandalName: pandal.name,
      userName: cleanUserName,
      imageUrl: imageUrl || pandal.thumbnailImage,
      caption: cleanCaption,
    });

    audioEngine.playTempleBell();
    setShowUploadModal(false);
    setCaption('');
    setUserName('');
    loadPhotos();
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16 sm:pb-6">
      {/* Top Header & Upload Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-ganesha-gold" />
            <span>Community Darshan Feed</span>
          </h2>
          <p className="text-xs text-gray-400">Live photos shared by devotees across Mumbai</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-1 bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Share Photo</span>
        </button>
      </div>

      {/* Photo Feed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((item) => (
          <div
            key={item.id}
            className="glass-panel gold-glow-card rounded-2xl overflow-hidden border border-ganesha-border flex flex-col justify-between"
          >
            <div>
              {/* Photo Image */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.caption}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-ganesha-gold/30 text-ganesha-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.pandalName}
                </div>
              </div>

              {/* Caption & User Info */}
              <div className="p-3.5 space-y-1.5">
                <p className="text-xs text-white font-medium leading-relaxed">
                  &ldquo;{item.caption}&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">By {item.userName}</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Pranam Blessing Button */}
            <div className="p-3 pt-0 border-t border-white/5 flex items-center justify-between mt-2">
              <button
                onClick={() => handlePranam(item.id)}
                className="flex items-center space-x-1.5 bg-ganesha-gold/15 text-ganesha-gold border border-ganesha-gold/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-ganesha-gold hover:text-slate-950 transition-all active:scale-95"
              >
                <span>🙏 Send Pranam</span>
                <span className="bg-slate-950/60 px-1.5 py-0.2 rounded-md text-[10px]">
                  {item.pranams}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel-gold rounded-3xl max-w-sm w-full border border-ganesha-gold/40 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Share Darshan Photo</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Select Pandal Tag:
                </label>
                <select
                  value={selectedPandalId}
                  onChange={(e) => setSelectedPandalId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-ganesha-gold"
                >
                  {PANDALS_DATA.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Devotee Name:
                </label>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Rahul Patil)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-ganesha-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Caption / Blessing Note:
                </label>
                <textarea
                  rows={2}
                  placeholder="Share your experience or chant... (e.g. Ganpati Bappa Morya!)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-ganesha-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Preset Photo Image Preview:
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-ganesha-gold"
                >
                  <option value="/images/pandals/lalbaug_360.png">Lalbaugcha Raja Darshan</option>
                  <option value="/images/pandals/gsb_360.png">GSB Gold Seva Idol</option>
                  <option value="/images/pandals/chintamani_360.png">Chinchpokli Chintamani</option>
                  <option value="/images/pandals/khetwadi_360.png">Khetwadi Floral Mandap</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 hover:brightness-110 active:scale-95 transition-all shadow-md mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Feed</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
