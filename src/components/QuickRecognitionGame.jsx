// src/components/QuickRecognitionGame.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';

const GAME_DURATION_PER_SONG = 8;    // secondes pour répondre
const AUDIO_PLAY_TIME = 3;           // durée de l'intro jouée
const INTRO_START_TIME = 45;         // secondes dans le morceau où commence l'intro

export default function QuickRecognitionGame({ onGameEnd }) {
  const [hits, setHits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Charger uniquement les hits qui ont un audio
  useEffect(() => {
    async function fetchHits() {
      try {
        const { data, error } = await supabase
          .from('hits')
          .select('id, title, artist, audio_path')
          .not('audio_path', 'is', null)
          .limit(20);

        if (error) throw error;

        if (data.length < 4) {
          setErrorMessage("Pas assez de hits avec audio pour jouer. Ajoute-en via l'admin.");
          setLoading(false);
          return;
        }

        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 8);
        setHits(shuffled);
      } catch (err) {
        console.error('Erreur chargement hits pour le jeu :', err);
        setErrorMessage('Erreur lors du chargement des hits.');
      } finally {
        setLoading(false);
      }
    }

    fetchHits();
  }, []);

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

  // Débloquer le contexte audio (obligatoire sur mobile et certains navigateurs)
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});

    setAudioUnlocked(true);
    setErrorMessage('');
  };

  // Jouer l'intro avec logs détaillés
  const playIntro = async () => {
    const current = hits[currentIndex];
    if (!current?.audio_path) {
      setErrorMessage("Ce hit n'a pas d'extrait audio.");
      return;
    }

    const url = getPublicUrl('audio', current.audio_path);
    
    console.log('🎵 Hit actuel:', current.title);
    console.log('📁 Chemin audio stocké:', current.audio_path);
    console.log('🔗 URL publique générée:', url);

    if (!url) {
      setErrorMessage("Impossible de générer l'URL de l'audio.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      audio.currentTime = INTRO_START_TIME;

      setIsIntroPlaying(true);
      setErrorMessage('');

      console.log('▶️ Tentative de lecture...');

      await audio.play();
      console.log('✅ Lecture démarrée avec succès !');

      // Arrêt automatique après 3 secondes
      setTimeout(() => {
        audio.pause();
        setIsIntroPlaying(false);
        console.log('⏹️ Intro arrêtée automatiquement');
      }, AUDIO_PLAY_TIME * 1000);

    } catch (err) {
      console.error('❌ Erreur lors de la lecture :', err.name, err.message);
      setIsIntroPlaying(false);

      if (err.name === 'NotAllowedError') {
        setErrorMessage("Le navigateur bloque la lecture. Clique à nouveau sur le bouton.");
      } else if (err.name === 'NotSupportedError') {
        setErrorMessage("Format audio non supporté ou fichier introuvable/corrompu.");
      } else {
        setErrorMessage(`Erreur audio : ${err.message}`);
      }
    }
  };

  const startTimer = () => {
    if (timeLeft > 0) return;

    setTimeLeft(GAME_DURATION_PER_SONG);
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

  const getChoices = () => {
    if (hits.length < 4) return hits;

    const correct = hits[currentIndex];
    const others = hits
      .filter(h => h.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [correct, ...others].sort(() => 0.5 - Math.random());
  };

  const handleAnswer = (chosenHit) => {
    if (selectedAnswer) return;

    setSelectedAnswer(chosenHit);
    setShowResult(true);
    clearInterval(timerRef.current);

    const correct = hits[currentIndex];
    if (chosenHit.id === correct.id) {
      const timeBonus = Math.floor(timeLeft * 10);
      setScore(prev => prev + 100 + timeBonus);
    }
  };

  const nextSong = () => {
    if (currentIndex + 1 >= hits.length) {
      onGameEnd?.(score);
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(0);
    setErrorMessage('');
  };

  if (loading) return <div className="text-center py-20 text-2xl animate-pulse">Préparation du Blind Test 80s...</div>;

  if (errorMessage && hits.length === 0) {
    return <div className="text-center py-20 text-xl text-red-400">{errorMessage}</div>;
  }

  const currentHit = hits[currentIndex];
  const choices = getChoices();

  return (
    <div className="max-w-2xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10 tracking-wide animate-pulse-slow">
        Tu reconnais ce hit ?
      </h2>

      <p className="text-3xl mb-8 font-extrabold">
        Score : <span className="text-neon-green neon-text">{score}</span>
      </p>

      {/* Bouton principal */}
      <button
        onClick={audioUnlocked ? playIntro : unlockAudio}
        disabled={isIntroPlaying}
        className={`mb-10 px-12 py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg transform hover:scale-105 ${
          isIntroPlaying
            ? 'bg-gray-700 cursor-wait opacity-70'
            : audioUnlocked
            ? 'bg-neon-blue hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]'
            : 'bg-gradient-to-r from-neon-pink to-neon-green hover:shadow-[0_0_50px_rgba(255,0,255,0.7)]'
        }`}
      >
        {isIntroPlaying
          ? 'Intro en cours...'
          : audioUnlocked
          ? 'Jouer l\'intro (3s)'
          : 'Activer le son & démarrer'}
      </button>

      {errorMessage && (
        <div className="mb-8 bg-red-950/50 border border-red-500/50 p-5 rounded-2xl text-red-300">
          {errorMessage}
        </div>
      )}

      {audioUnlocked && !isIntroPlaying && timeLeft === 0 && (
        <p className="text-lg text-neon-yellow mb-8 animate-pulse">
          Clique sur « Jouer l'intro (3s) » pour entendre le début du tube !
        </p>
      )}

      {/* Timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all duration-1000"
            style={{ width: `${(timeLeft / GAME_DURATION_PER_SONG) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft}s restantes` : 'Choisis ta réponse pour lancer le chrono'}
        </p>
      </div>

      {/* Choix de réponses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              handleAnswer(choice);
              startTimer();
            }}
            disabled={showResult}
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
              ? `✓ Excellent ! +${100 + Math.floor(timeLeft * 10)} pts`
              : `✗ C’était ${currentHit.title} de ${currentHit.artist}`}
          </p>

          <button
            onClick={nextSong}
            className="bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue text-white font-bold py-6 px-16 rounded-2xl text-2xl hover:shadow-[0_0_60px_rgba(255,0,255,0.7)] transition-all transform hover:scale-105"
          >
            {currentIndex + 1 >= hits.length ? 'Voir le score final' : 'Suivant →'}
          </button>
        </div>
      )}
    </div>
  );
}