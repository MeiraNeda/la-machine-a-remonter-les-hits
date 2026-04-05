// src/pages/ChallengesAndLeaderboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChallengesAndLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(0);

  // Charger le nombre de défis complétés depuis localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`completed_challenges_${user.id}`);
      setCompletedChallenges(saved ? parseInt(saved, 10) : 0);
    }
  }, [user]);

  // Charger le classement (inchangé)
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);

        // 1. Classement top 20 (inchangé, mais syntaxe propre)
        const { data: leaderboardData, error: lbError } = await supabase
          .from('leaderboard_view') // ← utilise la vue qu'on a créée
          .select('total_score, updated_at, user_id, email')
          .order('total_score', { ascending: false })
          .limit(20);

        if (lbError) throw lbError;

        const ranked = leaderboardData.map((entry, idx) => ({
          rank: idx + 1,
          score: entry.total_score,
          email: entry.email
            ? entry.email.replace(/(.{2}).*(?=@)/, '$1***')
            : 'Anonyme',
          isCurrentUser: entry.user_id === user?.id,
        }));

        setLeaderboard(ranked);

        // 2. Rang personnel de l'utilisateur connecté (correction clé : .single() !)
        if (user) {
          const { data: userScore, error: userError } = await supabase
            .from('leaderboard')
            .select('total_score')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userError && userError.code !== 'PGRST116') { // PGRST116 = pas de ligne trouvée (OK)
            throw userError;
          }

          if (userScore) {
            const { count, error: countError } = await supabase
              .from('leaderboard')
              .select('user_id', { count: 'exact', head: true })
              .gt('total_score', userScore.total_score);

            if (countError) throw countError;

            setUserRank({
              score: userScore.total_score,
              rank: count + 1,
            });
          } else {
            // Pas encore de score → on peut afficher un message
            setUserRank(null);
          }
        }
      } catch (err) {
        console.error('Erreur leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [user]);

  // Liste des défis disponibles immédiatement
  const challenges = [
    {
      title: "Tu reconnais ce hit ?",
      icon: "🎵",
      path: "/game/quick",
      desc: "3 secondes d’intro, 4 choix, score max si tu es ultra-rapide !",
      difficulty: "Facile",
      difficultyColor: "text-green-400",
      color: "from-neon-blue/30 to-neon-purple/30",
      hoverColor: "hover:border-neon-pink/70 hover:shadow-[0_0_40px_rgba(255,0,255,0.4)]",
      badge: "Populaire 🔥",
      badgeColor: "bg-neon-green text-black"
    },
    {
      title: "Blind Test Express",
      icon: "⚡",
      path: "/game/blind-test",
      desc: "10 extraits de 2 secondes seulement – zéro seconde pour répondre !",
      difficulty: "Difficile",
      difficultyColor: "text-red-400",
      color: "from-yellow-600/30 to-orange-600/30",
      hoverColor: "hover:border-yellow-400/70 hover:shadow-[0_0_40px_rgba(255,255,0,0.4)]",
      badge: "Nouveau !",
      badgeColor: "bg-neon-pink text-black"
    },
    {
      title: "Quiz Année par Année",
      icon: "📅",
      path: "/game/year-quiz",
      desc: "À quelle année appartient ce tube ? 1983, 1986 ou 1989 ?",
      difficulty: "Moyen",
      difficultyColor: "text-yellow-400",
      color: "from-cyan-600/30 to-blue-600/30",
      hoverColor: "hover:border-cyan-400/70 hover:shadow-[0_0_40px_rgba(0,255,255,0.4)]"
    },
    {
      title: "Paroles Manquantes",
      icon: "🎤",
      path: "/game/lyrics-fill",
      desc: "Complète les paroles cultes des refrains 80s",
      difficulty: "Moyen",
      difficultyColor: "text-yellow-400",
      color: "from-purple-600/30 to-pink-600/30",
      hoverColor: "hover:border-purple-400/70 hover:shadow-[0_0_40px_rgba(147,51,234,0.4)]"
    },
    {
      title: "Clip ou Pas Clip ?",
      icon: "📺",
      path: "/game/clip-guess",
      desc: "Était-ce un vrai clip MTV ou juste une chanson sans vidéo ?",
      difficulty: "Difficile",
      difficultyColor: "text-red-400",
      color: "from-red-600/30 to-orange-600/30",
      hoverColor: "hover:border-red-400/70 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
    },
    {
      title: "Artiste ou Groupe ?",
      icon: "👥",
      path: "/game/artist-or-band",
      desc: "Solo ou groupe ? Teste ta mémoire 80s à fond !",
      difficulty: "Facile",
      difficultyColor: "text-green-400",
      color: "from-teal-600/30 to-cyan-600/30",
      hoverColor: "hover:border-teal-400/70 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)]"
    },
    {
      title: "Vrai ou Faux 80s",
      icon: "❓",
      path: "/game/true-false",
      desc: "10 affirmations sur les tubes des 80s – vrai ou faux ?",
      difficulty: "Moyen",
      difficultyColor: "text-yellow-400",
      color: "from-indigo-600/30 to-purple-600/30",
      hoverColor: "hover:border-indigo-400/70 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20 px-4 md:px-6 relative">
      {/* Bouton retour fixe */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-neon-blue hover:text-neon-pink p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] backdrop-blur-sm"
        title="Retour à l'accueil"
      >
        ← Accueil
      </Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold neon-text text-center py-16 tracking-widest animate-pulse-slow">
          Défis 80s & Classement Mondial
        </h1>

        {/* Compteur défis complétés */}
        {user && (
          <div className="text-center mb-12">
            <p className="text-2xl md:text-3xl font-bold text-neon-green neon-text">
              Défis complétés : <span className="text-4xl">{completedChallenges}</span> / {challenges.length}
            </p>
            <p className="text-lg text-gray-400 mt-2">
              Continue à jouer pour débloquer le classement ultime !
            </p>
          </div>
        )}

        {/* Section défis */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-green mb-12 text-center neon-text">
            Défis disponibles maintenant
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <Link
                key={index}
                to={challenge.path}
                className={`group bg-gradient-to-br ${challenge.color} p-8 rounded-3xl border border-neon-blue/40 ${challenge.hoverColor} transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden`}
              >
                {/* Badge */}
                {challenge.badge && (
                  <div className={`absolute top-4 right-4 ${challenge.badgeColor} px-4 py-1 rounded-full text-xs font-bold shadow-md animate-pulse`}>
                    {challenge.badge}
                  </div>
                )}

                <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">
                  {challenge.icon}
                </div>

                <h3 className="text-3xl font-bold mb-3 text-center group-hover:text-neon-pink transition-colors">
                  {challenge.title}
                </h3>

                <p className="text-gray-300 mb-4 text-center text-lg">
                  {challenge.desc}
                </p>

                <p className={`text-center font-bold ${challenge.difficultyColor}`}>
                  Difficulté : {challenge.difficulty}
                </p>

                <div className="text-center mt-6">
                  <span className="inline-block bg-white/10 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-xl group-hover:bg-white/20 transition-all">
                    Jouer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Classement mondial (inchangé mais mieux mis en valeur) */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-pink mb-12 text-center neon-text">
            Classement Mondial
          </h2>

          {loading ? (
            <LoadingSpinner message="Chargement du classement mondial..." color="neon-green" />
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/60 rounded-3xl border border-neon-blue/30">
              <p className="text-2xl text-gray-400 mb-6">
                Aucun score enregistré pour le moment... sois le premier !
              </p>
              <Link
                to="/game/quick"
                className="inline-block bg-neon-green text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,0,0.6)] transition-all transform hover:scale-105"
              >
                Jouer maintenant →
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-gray-950/80 rounded-3xl overflow-hidden border border-neon-blue/40 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
                <table className="w-full text-left">
                  <thead className="bg-black/70">
                    <tr>
                      <th className="p-6 text-neon-green font-bold text-xl">Rang</th>
                      <th className="p-6 text-neon-green font-bold text-xl">Joueur</th>
                      <th className="p-6 text-neon-green font-bold text-xl text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.rank}
                        className={`border-t border-gray-800 transition-all duration-300 ${
                          entry.isCurrentUser
                            ? 'bg-gradient-to-r from-neon-blue/20 to-cyan-900/20 animate-pulse-slow'
                            : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <td className="p-6 font-bold text-xl">
                          {entry.rank === 1 && <span className="text-yellow-400 text-2xl">🥇 </span>}
                          {entry.rank === 2 && <span className="text-gray-300 text-2xl">🥈 </span>}
                          {entry.rank === 3 && <span className="text-amber-700 text-2xl">🥉 </span>}
                          {entry.rank}
                        </td>
                        <td className="p-6 text-lg">{entry.email}</td>
                        <td className="p-6 text-right text-xl font-extrabold text-neon-pink">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {user && userRank && (
                <div className="mt-12 p-8 bg-gradient-to-r from-neon-blue/20 to-purple-900/20 rounded-3xl border border-neon-blue/50 text-center animate-fade-in">
                  <p className="text-3xl font-bold text-neon-green mb-4">
                    Ton rang actuel : <span className="text-5xl">#{userRank.rank}</span>
                  </p>
                  <p className="text-2xl text-gray-200">
                    Score : <span className="text-neon-pink font-extrabold">{userRank.score.toLocaleString()} pts</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}