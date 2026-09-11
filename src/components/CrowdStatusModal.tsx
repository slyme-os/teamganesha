'use client';

import React, { useState } from 'react';
import { Pandal, CrowdLevel } from '../lib/types';
import { pandalService } from '../lib/services/pandalService';
import { sanitizeString, sanitizeNumber } from '../lib/security/sanitize';
import { X, Users, Clock, Send, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../lib/audio';

interface CrowdStatusModalProps {
  pandal: Pandal | null;
  onClose: () => void;
  onReportSubmitted: (pandalId: string, level: CrowdLevel, waitMinutes: number) => void;
}

export const CrowdStatusModal: React.FC<CrowdStatusModalProps> = ({
  pandal,
  onClose,
  onReportSubmitted,
}) => {
  const [level, setLevel] = useState<CrowdLevel>(pandal?.crowdLevel || 'medium');
  const [waitMinutes, setWaitMinutes] = useState<number>(pandal?.waitTimeMinutes || 45);
  const [reporterName, setReporterName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!pandal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Sanitize user inputs before dispatching
    const cleanReporterName = sanitizeString(reporterName, 60) || 'Devotee';
    const safeWaitMinutes = sanitizeNumber(waitMinutes, 5, 360, 45);

    try {
      await pandalService.submitCrowdReport(pandal.id, level, safeWaitMinutes, cleanReporterName);
      audioEngine.playTempleBell();
      setSubmitted(true);
      onReportSubmitted(pandal.id, level, safeWaitMinutes);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel rounded-3xl max-w-sm w-full border border-ganesha-border overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-ganesha-saffron/20 text-ganesha-saffron flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Crowd Report</h3>
              <p className="text-[11px] text-gray-400">{pandal.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Crowd Status Updated!</h4>
              <p className="text-xs text-gray-300">
                Thank you for helping fellow devotees with real-time updates.
              </p>
            </div>
          ) : (
            <>
              {/* Select Crowd Level */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">
                  Current Queue Density:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as CrowdLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        level === lvl
                          ? lvl === 'low'
                            ? 'bg-emerald-500/30 text-emerald-400 border-emerald-400'
                            : lvl === 'medium'
                            ? 'bg-amber-500/30 text-amber-300 border-amber-400'
                            : 'bg-red-500/30 text-red-400 border-red-400'
                          : 'glass-panel border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'low' ? '🟢 Low' : lvl === 'medium' ? '🟠 Medium' : '🔴 Heavy'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Wait Time */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-300 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-ganesha-gold" />
                    <span>Estimated Wait Time:</span>
                  </span>
                  <span className="font-bold text-ganesha-gold text-sm">
                    {waitMinutes < 60 ? `${waitMinutes} mins` : `${(waitMinutes / 60).toFixed(1)} hrs`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={waitMinutes}
                  onChange={(e) => setWaitMinutes(parseInt(e.target.value))}
                  className="w-full accent-ganesha-gold bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Reporter Name */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Your Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram (Parel)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  maxLength={60}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ganesha-gold"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Live Report'}</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
