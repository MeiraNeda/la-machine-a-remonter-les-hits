// src/pages/YearQuiz.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ← ajouté pour user (compteur défis)

const QUIZ_DURATION_PER_QUESTION = 12;  // secondes pour répondre
const AUDIO_PLAY_TIME = 5;              // durée de l'extrait
const INTRO_START_TIME = 45;            // début à 45s
const NB_QUESTIONS = 10;                // nombre de rounds
const NB_CHOICES = 4;                   // 1 bonne année + 3 fausses

export default function YearQuiz() {
  const { user } = useAuth(); // ← pour le compteur de défis terminés
  const [hits, setHits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [completedThisGame, setCompletedThisGame] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

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

  // Charger 20 hits aléatoires
  useEffect(() => {
    async function fetchHits() {
      try {
        const { data, error } = await supabase
          .from('hits')
          .select('id, title, artist, year, audio_path')
          .limit(20);

        if (error) throw error;

        const shuffled = data.sort(() => 0.5 - Math.random());
        setHits(shuffled);
      } catch (err) {
        console.error('Erreur chargement hits Year Quiz:', err);
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
      clearInterval(timerRef.current);
    };
  }, []);

  // Débloquer le contexte audio
  const unlockAudio = () => {
    if (audioUnlocked) return;

    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});

    setAudioUnlocked(true);
    alert("Son activé ! Clique maintenant sur 'Jouer l'extrait (5s)' pour commencer le Quiz Année par Année.");
  };

  // Jouer 5 secondes d’extrait
  const playIntro = () => {
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
        alert("Le navigateur bloque la lecture. Clique à nouveau.");
      }
    });

    setTimeout(() => {
      audio.pause();
      setIsPlaying(false);
    }, AUDIO_PLAY_TIME * 1000);
  };

  // Démarrer le timer
  const startTimer = () => {
    if (timeLeft > 0) return;

    setTimeLeft(QUIZ_DURATION_PER_QUESTION);
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

  // Générer 4 années plausibles (vraie + 3 proches)
  const getYearChoices = () => {
    const correctYear = hits[currentIndex].year;
    const years = [correctYear];

    // Ajouter 3 années proches (±1 à ±3 ans)
    for (let i = 1; i <= 3; i++) {
      if (Math.random() > 0.5) {
        years.push(correctYear + i);
      } else {
        years.push(correctYear - i);
      }
    }

    return years.sort(() => 0.5 - Math.random());
  };

  const handleAnswer = (chosenYear) => {
    if (selectedYear || !audioUnlocked) return;

    setSelectedYear(chosenYear);
    setShowResult(true);
    clearInterval(timerRef.current);

    const correctYear = hits[currentIndex].year;
    if (chosenYear === correctYear) {
      const timeBonus = Math.floor(timeLeft * 10);
      setScore(prev => prev + 100 + timeBonus);

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
    setSelectedYear(null);
    setShowResult(false);
    setTimeLeft(0);
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

  if (loading) return <div className="text-center py-40 text-3xl animate-pulse">Préparation du Quiz Année par Année...</div>;

  if (hits.length < NB_QUESTIONS) {
    return (
      <div className="text-center py-40 text-2xl text-red-400">
        Pas assez de hits pour lancer le quiz (minimum {NB_QUESTIONS}).
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
          Quiz Année par Année terminé !
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
              setSelectedYear(null);
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
  const yearChoices = getYearChoices();

  return (
    <div className="relative max-w-2xl mx-auto p-6 text-center min-h-screen flex flex-col justify-center">
      {/* Flash vert quand bonne réponse */}
      {isCorrectFlash && (
        <div className="fixed inset-0 bg-green-500/30 pointer-events-none animate-flash z-50" />
      )}

      <h2 className="text-5xl md:text-6xl font-bold neon-text mb-10 tracking-wide animate-pulse-slow">
        Quiz Année par Année
      </h2>

      <p className="text-3xl mb-8 font-extrabold">
        Question {currentIndex + 1} / {NB_QUESTIONS} – Score : <span className="text-neon-green">{score}</span>
      </p>

      {/* Bouton déblocage / jouer */}
      <button
        onClick={audioUnlocked ? playIntro : unlockAudio}
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
          ? 'Jouer l\'extrait (5s)'
          : 'Activer le son & commencer'}
      </button>

      {/* Message d’aide après déblocage */}
      {audioUnlocked && !isPlaying && timeLeft === 0 && (
        <p className="text-lg text-neon-yellow mb-8 animate-pulse">
          Prêt ? Clique sur « Jouer l'extrait (5s) » pour entendre le tube !
        </p>
      )}

      {/* Barre timer */}
      <div className="mb-12">
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-neon-blue/40 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / QUIZ_DURATION_PER_QUESTION) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xl font-semibold">
          {timeLeft > 0 ? `${timeLeft} secondes restantes` : 'Choisis l’année pour lancer le chrono !'}
        </p>
      </div>

      {/* Choix d'années */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
        {yearChoices.map(year => (
          <button
            key={year}
            onClick={() => {
              handleAnswer(year);
              startTimer();
            }}
            disabled={showResult || !audioUnlocked}
            className={`p-8 rounded-2xl text-3xl font-bold transition-all duration-300 transform hover:scale-105 ${
              showResult
                ? year === currentHit.year
                  ? 'bg-green-600 scale-105 shadow-[0_0_30px_rgba(0,255,0,0.6)]'
                  : year === selectedYear
                  ? 'bg-red-600 scale-95'
                  : 'bg-gray-800 opacity-60'
                : 'bg-gradient-to-br from-neon-blue/40 to-neon-purple/30 hover:from-neon-blue/60 hover:to-neon-purple/50 border border-neon-blue/50'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Résultat */}
      {showResult && (
        <div className="mt-8 animate-fade-in">
          <p className="text-3xl md:text-4xl font-bold mb-8 neon-text">
            {selectedYear === currentHit.year
              ? `✓ PARFAIT ! +${100 + Math.floor(timeLeft * 10)} pts`
              : `✗ C’était ${currentHit.year} – ${currentHit.title} de ${currentHit.artist}`}
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