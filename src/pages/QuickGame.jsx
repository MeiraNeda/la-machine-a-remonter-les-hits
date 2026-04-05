// src/pages/QuickGame.jsx
import { useState, useEffect  } from 'react';
import QuickRecognitionGame from '../components/QuickRecognitionGame';
import { Link } from 'react-router-dom';

export default function QuickGame() {
  const [gameScore, setGameScore] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation du score à l'arrivée
  useEffect(() => {
    if (gameScore !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [gameScore]);

  // Message personnalisé selon le score
  const getScoreMessage = (score) => {
    if (score >= 8000) return "LÉGENDE ABSOLUE ! 🔥 Tu es la MACHINE À HITS !";
    if (score >= 5000) return "Excellent ! Tu maîtrises les 80s comme personne.";
    if (score >= 3000) return "Pas mal du tout ! Continue, le top est proche.";
    if (score >= 1000) return "Solide début. Les refrains cultes t'attendent !";
    return "Pas grave... les 80s sont intemporelles. Reviens plus fort ! 😎";
  };

  // Générer lien de partage X
  const shareOnX = () => {
    const text = `Je viens de scorer ${gameScore} points sur MACHINE À HITS 80s ! Qui peut faire mieux ? #80sHits #BlindTest`;
    const url = window.location.origin;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  if (gameScore !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center animate-fade-in">
          {/* Confettis légers via CSS */}
          <div className="confetti-container" />

          <h1 className="text-6xl md:text-8xl font-extrabold neon-text mb-8 animate-pulse-slow">
            FIN DU DÉFI !
          </h1>

          <div className={`text-7xl md:text-9xl font-black mb-6 transition-all duration-1000 ${isAnimating ? 'scale-125 opacity-100' : 'scale-100 opacity-90'}`}>
            <span className="text-neon-green drop-shadow-[0_0_20px_rgba(0,255,0,0.7)]">
              {gameScore}
            </span>
            <span className="text-4xl md:text-5xl ml-4 text-gray-400">pts</span>
          </div>

          <p className="text-2xl md:text-3xl text-gray-300 mb-10 font-medium">
            {getScoreMessage(gameScore)}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => {
                setGameScore(null);
                setIsAnimating(false);
              }}
              className="bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] transition-all transform hover:scale-105"
            >
              Rejouer →
            </button>

            <button
              onClick={shareOnX}
              className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <span>Partager sur X</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            <Link
              to="/challenges"
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105"
            >
              Retour aux défis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <QuickRecognitionGame onGameEnd={setGameScore} />
    </div>
  );
}