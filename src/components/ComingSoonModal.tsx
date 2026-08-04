import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Sparkles, Clock, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'craftsmanship' | 'vip'>('overview');

  // Countdown timer target state (Fall 2026 Launch)
  const [timeLeft, setTimeLeft] = useState({ days: 42, hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: prev.minutes > 0 ? prev.minutes - 1 : 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    sounds.playModalOpenSound();
    setIsSubmitted(true);

    // Trigger luxury celebratory confetti effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#fef08a', '#ffffff', '#93c5fd'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleClose = () => {
    sounds.playClickSound();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay with Backdrop Click Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
          >
            {/* Ambient Background Aura inside Modal */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Close (X) Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-white p-2 rounded-full glass-pill border border-white/10 hover:border-amber-500/40 transition-all group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Modal Content Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 glass-pill px-3.5 py-1 rounded-full text-[11px] font-mono-tech text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Maison Vespera • Autumn / Winter 2026</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold tracking-tight text-white leading-tight">
                Something Extraordinary <br />
                <span className="gold-gradient-text">is Packing.</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Our master artisans in Paris are finalizing the limited edition leatherwork line.
                Be among the select few to receive private access prior to public release.
              </p>
            </div>

            {/* Interactive Feature Tabs */}
            <div className="flex justify-center border-b border-white/10 my-6">
              {[
                { id: 'overview', label: 'Launch VIP Access' },
                { id: 'craftsmanship', label: 'Bespoke Specs' },
                { id: 'vip', label: 'Privileges' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClickSound();
                    setActiveTab(tab.id as 'overview' | 'craftsmanship' | 'vip');
                  }}
                  className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors relative ${
                    activeTab === tab.id ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-200"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Email Subscription */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Live Countdown Timer */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto py-2 text-center">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Minutes', val: timeLeft.minutes },
                    { label: 'Seconds', val: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <div key={idx} className="glass-pill p-2 sm:p-3 rounded-xl border border-white/10">
                      <span className="text-xl sm:text-2xl font-mono-tech font-bold text-amber-200 block">
                        {String(unit.val).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 tracking-wider uppercase">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Email Form / Success State */}
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your VIP email address..."
                        className="w-full bg-slate-900/80 text-white placeholder-slate-500 text-sm rounded-full pl-12 pr-36 py-3.5 border border-white/15 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-semibold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-lg hover:shadow-amber-500/25 active:scale-95"
                      >
                        <span>Notify Me</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Strictly 500 invitations available worldwide. No spam guarantee.
                    </p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-pill p-5 rounded-2xl border border-amber-500/40 text-center space-y-2 max-w-md mx-auto"
                  >
                    <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                    <h3 className="text-lg font-serif-luxury font-bold text-amber-200">
                      Invitation Confirmed
                    </h3>
                    <p className="text-xs text-slate-300">
                      We have logged <span className="text-white font-mono">{email}</span> into the private VIP register. Check your inbox shortly for private key access.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Tab 2: Bespoke Craftsmanship Specs */}
            {activeTab === 'craftsmanship' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 text-left"
              >
                {[
                  {
                    icon: Award,
                    title: 'Full-Grain Calfskin',
                    desc: 'Hand-tanned leather sourced from sustainable French tanneries.',
                  },
                  {
                    icon: ShieldCheck,
                    title: '24K Gold Clasp',
                    desc: 'Precision engraved titanium core coated in polished 24K gold.',
                  },
                  {
                    icon: Clock,
                    title: '48h Hand Stitched',
                    desc: 'Each piece takes over 48 hours of artisanal hand craftsmanship.',
                  },
                ].map((spec, i) => (
                  <div key={i} className="glass-pill p-4 rounded-xl border border-white/10 space-y-1.5">
                    <spec.icon className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{spec.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">{spec.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Tab 3: VIP Privileges */}
            {activeTab === 'vip' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-pill p-4 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2 max-w-md mx-auto"
              >
                <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Exclusive Member Benefits</span>
                </div>
                <ul className="space-y-1.5 text-left list-disc list-inside text-slate-300">
                  <li>24-Hour Private Preview Window prior to public release.</li>
                  <li>Custom Monogramming & Bespoke Leather Engraving included.</li>
                  <li>Complimentary Express Worldwide Atelier Delivery.</li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
