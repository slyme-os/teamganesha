'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Pandal } from '../lib/types';
import {
  getVerifiedUpiDetails,
  generateSanitizedUpiUrl,
  generateSanitizedAppIntent,
} from '../lib/constants/upiConfig';
import { X, Check, Copy, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { audioEngine } from '../lib/audio';

interface DonationModalProps {
  pandal: Pandal | null;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ pandal, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(108);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!pandal) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const verifiedUpi = getVerifiedUpiDetails(pandal.id);

  // Formulate sanitized universal UPI payload & app deep links
  const upiUrl = generateSanitizedUpiUrl(
    pandal.id,
    currentAmount,
    `Virtual Ganpati Seva - ${pandal.name}`
  );

  const gpayUrl = generateSanitizedAppIntent(pandal.id, currentAmount, 'gpay');
  const phonepeUrl = generateSanitizedAppIntent(pandal.id, currentAmount, 'phonepe');
  const paytmUrl = generateSanitizedAppIntent(pandal.id, currentAmount, 'paytm');

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(verifiedUpi.vpa);
    setCopied(true);
    audioEngine.playTempleBell();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="glass-panel-gold rounded-3xl max-w-md w-full border border-ganesha-gold/40 overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-ganesha-dark via-slate-900 to-ganesha-dark border-b border-ganesha-gold/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-ganesha-gold/20 text-ganesha-gold flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Direct Mandal Donation</h3>
              <p className="text-[11px] text-gray-400">{pandal.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* 0% Fee Guarantee Banner */}
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-2xl text-emerald-400 text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <span className="font-bold block text-emerald-300">0% Intermediary Fee Guarantee</span>
              <span className="text-[11px] text-gray-300">
                100% of your donation goes directly into {verifiedUpi.bankName} account.
              </span>
            </div>
          </div>

          {/* Preset Amount Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              Select Donation Amount:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[51, 108, 501, 1008].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountClick(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-ganesha-gold text-slate-950 border-ganesha-gold shadow-md scale-105'
                      : 'glass-panel border-white/10 text-gray-300 hover:border-ganesha-gold/50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mt-2.5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Custom Amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                max="100000"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ganesha-gold transition-all"
              />
            </div>
          </div>

          {/* Dynamic UPI QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-ganesha-gold shadow-inner space-y-2">
            <QRCodeSVG value={upiUrl} size={160} level="H" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-800 block uppercase tracking-wider">
                Scan with GPay / Paytm / PhonePe
              </span>
              <span className="text-[12px] font-extrabold text-ganesha-saffron-dark">
                Amount: ₹{currentAmount}
              </span>
            </div>
          </div>

          {/* Verified VPA Copy Bar */}
          <div className="bg-slate-950/90 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide block font-semibold">
                Official Mandal UPI VPA
              </span>
              <span className="text-xs font-mono font-bold text-ganesha-gold truncate">
                {verifiedUpi.vpa}
              </span>
            </div>
            <button
              onClick={handleCopyVpa}
              className="flex items-center space-x-1 bg-ganesha-gold/20 text-ganesha-gold border border-ganesha-gold/40 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-ganesha-gold hover:text-slate-950 transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Direct UPI App Deep-Links */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-gray-400 font-medium block text-center">
              Tap below to pay instantly via UPI app:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Google Pay */}
              <a
                href={gpayUrl}
                className="flex items-center justify-center space-x-1.5 bg-slate-900 border border-blue-500/40 hover:border-blue-400 text-blue-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95"
              >
                <span>Google Pay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* PhonePe */}
              <a
                href={phonepeUrl}
                className="flex items-center justify-center space-x-1.5 bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-purple-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95"
              >
                <span>PhonePe</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Paytm */}
              <a
                href={paytmUrl}
                className="flex items-center justify-center space-x-1.5 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95"
              >
                <span>Paytm</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Universal BHIM / Any UPI App */}
              <a
                href={upiUrl}
                className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Any UPI App</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
