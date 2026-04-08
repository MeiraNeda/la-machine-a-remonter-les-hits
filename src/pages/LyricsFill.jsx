// src/pages/LyricsFill.jsx
import { useState, useEffect, useRef } from 'react';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import des données externes (fichiers séparés)
import { frenchLyricsData } from '../data/frenchLyricsData';
import { allLyricsData } from '../data/allLyrics';

const QUIZ_DURATION = 15;
const AUDIO_PLAY_TIME = 5;
const INTRO_START_TIME = 45;
const NB_QUESTIONS = 8;

export default function LyricsFill() {
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // null = écran de choix, 'french' ou 'all'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Préparer les questions une fois le mode choisi
  useEffect(() => {
    if (!mode) return;

    const dataToUse = mode === 'french' ? frenchLyricsData : allLyricsData;

    const shuffled = [...dataToUse]
      .sort(() => 0.5 - Math.random())
      .slice(0, NB_QUESTIONS);

    setQuestions(shuffled);
    setLoading(false);
  }, [mode]);

  // Initialisation audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.85;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});
    setAudioUnlocked(true);
    setAudioError('');
  };

  const playExcerpt = async () => {
    const current = questions[currentIndex];
    if (!current?.audio_path) {
      setAudioError("Aucun fichier audio pour cette question.");
      return;
    }

    const url = getPublicUrl('audio', current.audio_path);
    console.log("🎵 Tentative de lecture pour :", current.title);
    console.log("📁 Chemin dans la DB :", current.audio_path);
    console.log("🔗 URL générée :", url);

    if (!url) {
      setAudioError("Impossible de générer l'URL audio.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      audio.currentTime = INTRO_START_TIME;

      setIsPlaying(true);
      setAudioError('');

      console.log("▶️ Lecture lancée...");
      await audio.play();
      console.log("✅ Lecture démarrée avec succès");

      setTimeout(() => {
        audio.pause();
        setIsPlaying(false);
        console.log("⏹️ Extrait terminé");
      }, AUDIO_PLAY_TIME * 1000);

    } catch (err) {
      console.error('❌ Erreur lecture audio:', err.name, err.message);
      setIsPlaying(false);

      if (err.name === 'NotSupportedError') {
        setAudioError("Fichier audio introuvable ou format non supporté.\nVérifie que le bucket 'audio' est public et que le fichier existe.");
      } else if (err.name === 'NotAllowedError') {
        setAudioError("Le navigateur bloque la lecture automatique. Clique à nouveau sur le bouton.");
      } else {
        setAudioError("Erreur inconnue : " + err.message);
      }
    }
  };

  const startTimer = () => {
    if (timeLeft > 0) return;
    setTimeLeft(QUIZ_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (chosen) => {
    if (selectedAnswer || !audioUnlocked) return;
    setSelectedAnswer(chosen);
    setShowResult(true);
    clearInterval(timerRef.current);

    if (chosen === questions[currentIndex].missingWord) {
      const timeBonus = Math.floor(timeLeft * 8);
      setScore(prev => prev + 100 + timeBonus);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= NB_QUESTIONS) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(0);
    setAudioError('');
  };

  const resetGame = () => {
    setMode(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(0);
    setAudioError('');
  };

  // ====================== ÉCRAN DE SÉLECTION DU MODE ======================
  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="max-w-md w-full text-center">
          <h1 className="text-5xl md:text-6xl font-bold neon-text mb-12">
            Quiz Paroles
          </h1>
          <p className="text-2xl mb-10 text-gray-300">
            Choisis ton mode de jeu
          </p>

          <div className="space-y-6">
            <button
              onClick={() => setMode('french')}
              className="w-full py-8 px-10 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-bold hover:scale-105 transition-all shadow-xl"
            >
              🇫🇷 Chansons françaises uniquement
            </button>

            <button
              onClick={() => setMode('all')}
              className="w-full py-8 px-10 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl font-bold hover:scale-105 transition-all shadow-xl"
            >
              🌍 Toutes les chansons (FR + International)
            </button>
          </div>

          <Link
            to="/challenges"
            className="mt-12 inline-block text-neon-blue hover:text-neon-pink transition-colors"
          >
            ← Retour aux défis
          </Link>
        </div>
      </div>
    );
  }

  // ====================== ÉCRAN DE CHARGEMENT ======================
  if (loading || questions.length === 0) {
    return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Quiz Paroles...</div>;
  }

  // ====================== ÉCRAN GAME OVER ======================
  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12">Quiz Paroles terminé !</h2>
        <p className="text-4xl font-extrabold mb-10">
          Score final : <span className="text-neon-green">{score} points</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link to="/challenges" className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-6 px-12 rounded-2xl text-2xl">
            Retour aux défis
          </Link>
          <button 
            onClick={resetGame} 
            className="bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl"
          >
            Rejouer →
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="relative max-w-3xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10">Paroles Manquantes</h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      <button
        onClick={audioUnlocked ? playExcerpt : unlockAudio}
        disabled={isPlaying}
        className={`mb-12 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isPlaying ? 'bg-gray-700 cursor-wait' : audioUnlocked ? 'bg-neon-blue hover:bg-cyan-400' : 'bg-gradient-to-r from-neon-pink to-neon-green'
        }`}
      >
        {isPlaying ? 'Extrait en cours...' : audioUnlocked ? 'Jouer l\'extrait (5s)' : 'Activer le son & commencer'}
      </button>

      {audioError && (
        <div className="mb-8 p-5 bg-red-950/70 border border-red-500 rounded-2xl text-red-300 text-left">
          {audioError}
        </div>
      )}

      {/* Timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40">
          <div 
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all" 
            style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }} 
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft}s restantes` : 'Choisis ta réponse après avoir écouté'}
        </p>
      </div>

      <div className="mb-12 p-8 bg-gray-900/60 rounded-2xl border border-neon-purple/40 text-2xl md:text-3xl leading-relaxed min-h-[120px]">
        <p className="text-center">{current.lyrics.replace('_____', '_____')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {current.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => { handleAnswer(choice); startTimer(); }}
            disabled={showResult || !audioUnlocked}
            className={`p-6 rounded-2xl text-xl font-bold transition-all hover:scale-105 ${
              showResult
                ? choice === current.missingWord ? 'bg-green-600 scale-105' : choice === selectedAnswer ? 'bg-red-600' : 'bg-gray-800 opacity-60'
                : 'bg-gradient-to-br from-neon-blue/40 to-neon-purple/30 hover:from-neon-blue/60'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mt-8">
          <p className="text-3xl md:text-4xl font-bold mb-8 neon-text">
            {selectedAnswer === current.missingWord
              ? `✓ PARFAIT ! +${100 + Math.floor(timeLeft * 8)} pts`
              : `✗ La bonne réponse était : "${current.missingWord}"`}
          </p>
          <button 
            onClick={nextQuestion} 
            className="bg-gradient-to-r from-neon-pink to-purple-500 text-white font-bold py-6 px-16 rounded-2xl text-2xl hover:shadow-[0_0_50px_rgba(255,0,255,0.6)]"
          >
            Question suivante →
          </button>
        </div>
      )}
    </div>
  );
}