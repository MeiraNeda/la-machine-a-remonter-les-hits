// src/components/StorySwiper.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

export default function StorySwiper({ chapters = [], autoPlay = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const chapter = chapters[currentIndex] || {};

  // Swipe handlers (TikTok-like : up = next, down = previous)
  const handlers = useSwipeable({
    onSwipedUp: () => goToNext(),
    onSwipedDown: () => goToPrev(),
    trackMouse: true, // pour tester sur desktop
    delta: 80,        // sensibilité du swipe
  });

  const goToNext = () => {
    if (currentIndex < chapters.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || isPaused || !chapter.duration_sec) return;

    const duration = (chapter.duration_sec || 15) * 1000;

    timerRef.current = setTimeout(() => {
      goToNext();
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, isPaused, chapters, autoPlay]);

  // Progress bar style
  const progress = chapter.duration_sec
    ? `${((currentIndex + 1) / chapters.length) * 100}%`
    : '100%';

  return (
    <div
      {...handlers}
      className="relative h-screen w-full max-w-md mx-auto overflow-hidden bg-black touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Progress bars en haut (style TikTok) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
        {chapters.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-neon-pink"
              initial={{ width: idx < currentIndex ? '100%' : '0%' }}
              animate={{ width: idx === currentIndex ? '100%' : idx < currentIndex ? '100%' : '0%' }}
              transition={{ duration: idx === currentIndex ? (chapter.duration_sec || 15) : 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Chapitre courant */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold neon-text mb-8">
            {chapter.title || `Chapitre ${chapter.order}`}
          </h2>

          <p className="text-lg md:text-xl leading-relaxed max-w-lg text-gray-200">
            {chapter.text || 'Aucune description pour ce chapitre...'}
          </p>

          <div className="mt-12 text-sm opacity-70">
            {chapter.duration_sec && `${chapter.duration_sec}s • Swipe ↑ pour continuer`}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs de navigation (optionnel sur desktop) */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 text-white/60 text-sm">
        <button onClick={goToPrev} className="hover:text-neon-blue">Précédent</button>
        <span>{currentIndex + 1} / {chapters.length}</span>
        <button onClick={goToNext} className="hover:text-neon-pink">Suivant</button>
      </div>
    </div>
  );
}