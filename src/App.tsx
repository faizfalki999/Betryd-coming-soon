import { useState } from 'react';
import { ThreeLogoCanvas } from './components/ThreeLogoCanvas';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DiscountModal } from './components/DiscountModal';
import { BackgroundGrid } from './components/BackgroundGrid';
import { PullToRefresh } from './components/PullToRefresh';
import { sounds } from './utils/audio';

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    sounds.enabled = nextState;
    if (nextState) {
      sounds.playClickSound();
    }
  };

  return (
    <main className="relative w-full h-dvh min-h-dvh overflow-hidden bg-white text-neutral-900 flex flex-col justify-between select-none font-sans antialiased">
      {/* Pull down to refresh gesture indicator */}
      <PullToRefresh />

      {/* Technical Studio Background Lines & Reticle */}
      <BackgroundGrid />

      {/* Top Header with Centered Brand Title */}
      <Header />

      {/* Center Viewport: Interactive 3D Freely Rotating Logo */}
      <section className="relative z-10 w-full h-full flex items-center justify-center">
        <ThreeLogoCanvas onLogoClick={handleOpenModal} isModalOpen={isModalOpen} />
      </section>

      {/* Discount Signup Form Modal */}
      <DiscountModal isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Bottom Footer with Sound Toggle Button at Bottom Right */}
      <Footer onOpenModal={handleOpenModal} isAudioEnabled={isAudioEnabled} onToggleAudio={toggleAudio} />
    </main>
  );
}

export default App;
