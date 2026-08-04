import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { submitToBrevo } from '../utils/brevo';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');
    sounds.playClickSound();

    const res = await submitToBrevo({ name, email });
    setIsLoading(false);

    if (res.success) {
      setIsSubmitted(true);
      sounds.playModalOpenSound();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#333333', '#666666', '#d4af37', '#ffffff'],
        });
      } catch {
        // Fallback swallow
      }
    } else {
      setErrorMessage(res.message || 'Error subscribing. Please try again.');
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setEmail('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Backdrop overlay dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container (Pure White background & crisp black text) */}
      <div
        className="relative z-10 w-full max-w-lg bg-white text-black rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden transform transition-all duration-300 scale-100"
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
        
        {/* Top Header Bar (Pure White with black border & text) */}
        <div
          className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-archivo text-xs font-bold tracking-widest uppercase text-black"
              style={{ fontFamily: "'Archivo Black', sans-serif", color: '#000000' }}
            >
              BETRYD STUDIO
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 bg-white" style={{ backgroundColor: '#ffffff' }}>
          {!isSubmitted ? (
            <div>
              {/* Heading */}
              <div className="mb-6">
                <h2
                  className="font-archivo text-2xl sm:text-3xl tracking-tight text-gray-900 font-bold mb-2 uppercase"
                  style={{ fontFamily: "'Archivo Black', sans-serif", color: '#111827' }}
                >
                  SIGN UP FOR UPDATES
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed font-sans" style={{ color: '#4b5563' }}>
                  Join the list. Get early access and{' '}
                  <strong className="text-black font-semibold" style={{ color: '#000000' }}>Exclusive Rewards</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium text-center">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
                <div>
                  <label className="block text-xs font-archivo tracking-wider uppercase text-gray-900 mb-1.5 font-bold" style={{ fontFamily: "'Archivo Black', sans-serif", color: '#111827' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{ backgroundColor: '#f9fafb', color: '#000000' }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black font-medium text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-archivo tracking-wider uppercase text-gray-900 mb-1.5 font-bold" style={{ fontFamily: "'Archivo Black', sans-serif", color: '#111827' }}>
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    style={{ backgroundColor: '#f9fafb', color: '#000000' }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black font-medium text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  className="w-full mt-2 py-3.5 px-6 bg-black hover:bg-gray-800 text-white font-mono text-xs tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer font-bold"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="font-bold">SIGN UP</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-gray-500 mt-3 font-sans" style={{ color: '#6b7280' }}>
                  By signing up, you agree to receive Betryd launch updates. Unsubscribe anytime.
                </p>
              </form>
            </div>
          ) : (
            /* Success View */
            <div className="text-center py-6 bg-white">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <h3 className="text-2xl font-bold text-black mb-2">You're On The List!</h3>
              <p className="text-sm text-neutral-700 max-w-xs mx-auto mb-6">
                Thank you <span className="font-bold text-black">{name || 'VIP'}</span>. You will receive early access and launch updates.
              </p>

              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono tracking-widest uppercase rounded-xl shadow-md transition-all cursor-pointer font-bold"
              >
                CLOSE & RETURN TO PREVIEW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
