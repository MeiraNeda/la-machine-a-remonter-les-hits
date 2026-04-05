// src/pages/BlindTest.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ← ajouté pour user (compteur défis)

const BLIND_TEST_DURATION = 2;      // secondes d'extrait
const INTRO_START_TIME = 45;        // début à 45s pour éviter les longs intros
const NB_QUESTIONS = 10;            // nombre de rounds
const NB_CHOICES = 4;               // 1 bonne + 3 fausses

export default function BlindTest() {
  const { user } = useAuth(); // ← pour le compteur de défis terminés
  const [hits, setHits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [completedThisGame, setCompletedThisGame] = useState(false);

  const audioRef = useRef(null);

  // Compter ce défi dans le compteur global « Défis complétés »
  useEffect(() => {
    if (!user || !gameOver || completedThisGame) return;

    const key = `completed_challenges_${user.id}`;
    const saved = localStorage.getItem(key);
    const currentCount = saved ? parseInt(saved, 10) : 0;
    const newCount = currentCount + 1;

    localStorage.setItem(key, newCount);
    setCompletedThisGame(true);
  }, [gameOver, user, completedThisGame]);

  // Charger 20 hits aléatoires au démarrage
  useEffect(() => {
    async function fetchHits() {
      try {
        const { data, error } = await supabase
          .from('hits')
          .select('id, title, artist, audio_path')
          .limit(20);

        if (error) throw error;

        const shuffled = data.sort(() => 0.5 - Math.random());
        setHits(shuffled);
      } catch (err) {
        console.error('Erreur chargement hits Blind Test:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHits();
  }, []);

  // Création audio unique
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.8;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Débloquer le contexte audio (obligatoire sur mobile)
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});

    setAudioUnlocked(true);
    alert("Son activé ! Clique sur 'Jouer l'extrait (2s)' pour commencer le Blind Test Express.");
  };

  // Jouer 2 secondes d'extrait à partir de INTRO_START_TIME
  const playBlindIntro = () => {
    if (!hits[currentIndex]?.audio_path) return;

    const url = getPublicUrl('audio', hits[currentIndex].audio_path);
    if (!url) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = url;
    audio.currentTime = INTRO_START_TIME;
    audio.load();

    setIsPlaying(true);

    audio.play().catch(err => {
      if (err.name === 'NotAllowedError') {
        alert("Le navigateur bloque la lecture. Clique à nouveau sur le bouton.");
      }
    });

    // Arrêt forcé après 2 secondes
    setTimeout(() => {
      audio.pause();
      setIsPlaying(false);
    }, BLIND_TEST_DURATION * 1000);
  };

  // Générer 4 choix (1 bonne + 3 fausses aléatoires)
  const getChoices = () => {
    if (hits.length < NB_CHOICES) return hits;

    const correct = hits[currentIndex];
    const others = hits
      .filter(h => h.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, NB_CHOICES - 1);

    return [correct, ...others].sort(() => 0.5 - Math.random());
  };

  const handleAnswer = (chosen) => {
    if (selectedAnswer || !audioUnlocked) return;

    setSelectedAnswer(chosen);
    setShowResult(true);

    const correct = hits[currentIndex];
    if (chosen.id === correct.id) {
      setScore(prev => prev + 100); // 100 pts par bonne réponse (pas de bonus temps ici)

      // Flash vert + son de bonne réponse
      setIsCorrectFlash(true);
      const ding = new Audio('https://assets.codepen.io/605876/ding.mp3'); // son gratuit court
      ding.volume = 0.6;
      ding.play().catch(() => {});

      setTimeout(() => setIsCorrectFlash(false), 1000);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= NB_QUESTIONS || currentIndex + 1 >= hits.length) {
      setGameOver(true);
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

    const saveScore = async () => {
      if (!user) return;

      await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          game_name: "Blind Test Express", // ← change selon le jeu
          score: score
        });
    };

    useEffect(() => {
      if (gameOver) {
        saveScore();
      }
    }, [gameOver]);

  if (loading) {
    return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Blind Test Express...</div>;
  }

  if (hits.length < NB_QUESTIONS) {
    return (
      <div className="text-center py-40 text-2xl text-red-400">
        Pas assez de hits avec audio pour lancer le Blind Test (minimum {NB_QUESTIONS}).
        <br />
        <Link to="/admin" className="text-neon-pink underline mt-4 inline-block">
          Ajoute des hits dans l'admin →
        </Link>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-6xl font-bold neon-text mb-12 animate-pulse-slow">
          Blind Test Express terminé !
        </h2>

        <p className="text-4xl font-extrabold mb-10">
          Score final : <span className="text-neon-green">{score} points</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link
            to="/challenges"
            className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all transform hover:scale-105"
          >
            Retour aux défis
          </Link>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setGameOver(false);
              setSelectedAnswer(null);
              setShowResult(false);
            }}
            className="bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] transition-all transform hover:scale-105"
          >
            Rejouer →
          </button>
        </div>
      </div>
    );
  }

  const currentHit = hits[currentIndex];
  const choices = getChoices();

  return (
    <div className="relative max-w-2xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      {/* Flash vert quand bonne réponse */}
      {isCorrectFlash && (
        <div className="fixed inset-0 bg-green-500/30 pointer-events-none animate-flash z-50" />
      )}

      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10 tracking-wide animate-pulse-slow">
        Blind Test Express ⚡
      </h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      {/* Bouton déblocage / jouer */}
      <button
        onClick={audioUnlocked ? playBlindIntro : unlockAudio}
        disabled={isPlaying}
        className={`mb-12 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isPlaying
            ? 'bg-gray-700 cursor-wait opacity-70'
            : audioUnlocked
            ? 'bg-neon-blue hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]'
            : 'bg-gradient-to-r from-neon-pink to-neon-green hover:shadow-[0_0_50px_rgba(255,0,255,0.7)]'
        }`}
      >
        {isPlaying
          ? 'Extrait en cours...'
          : audioUnlocked
          ? 'Jouer l\'extrait (2s)'
          : 'Activer le son & commencer'}
      </button>

      {/* Message d’aide après déblocage */}
      {audioUnlocked && !isPlaying && !showResult && (
        <p className="text-lg text-neon-yellow mb-8 animate-pulse">
          Prêt ? Clique sur « Jouer l'extrait (2s) » pour tester ta vitesse !
        </p>
      )}

      {/* Choix de réponses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {choices.map(choice => (
          <button
            key={choice.id}
            onClick={() => handleAnswer(choice)}
            disabled={showResult || !audioUnlocked}
            className={`p-6 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              showResult
                ? choice.id === currentHit.id
                  ? 'bg-green-600 scale-105 shadow-[0_0_30px_rgba(0,255,0,0.6)]'
                  : choice.id === selectedAnswer?.id
                  ? 'bg-red-600 scale-95'
                  : 'bg-gray-800 opacity-60'
                : 'bg-gradient-to-br from-neon-blue/40 to-neon-purple/30 hover:from-neon-blue/60 hover:to-neon-purple/50 border border-neon-blue/50'
            }`}
          >
            {showResult && choice.id !== currentHit.id
              ? '❌ ' + choice.title
              : choice.title} – {choice.artist}
          </button>
        ))}
      </div>

      {/* Résultat */}
      {showResult && (
        <div className="mt-8 animate-fade-in">
          <p className="text-3xl md:text-4xl font-bold mb-8 neon-text">
            {selectedAnswer?.id === currentHit.id
              ? '✓ PARFAIT ! +100 pts'
              : `✗ C’était ${currentHit.title} de ${currentHit.artist}`}
          </p>

          <button
            onClick={nextQuestion}
            className="bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue text-white font-bold py-6 px-16 rounded-2xl text-2xl hover:shadow-[0_0_60px_rgba(255,0,255,0.7)] transition-all transform hover:scale-105"
          >
            Question suivante →
          </button>
        </div>
      )}
    </div>
  );
}