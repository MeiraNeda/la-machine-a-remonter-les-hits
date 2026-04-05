// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [gamesPlayedByType, setGamesPlayedByType] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Compteur défis terminés (localStorage)
    const key = `completed_challenges_${user.id}`;
    const saved = localStorage.getItem(key);
    const count = saved ? parseInt(saved, 10) : 0;
    setCompletedChallenges(count);

    // Récupérer avatar depuis table profiles
    async function fetchProfile() {
        const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (!data) {
            await supabase.from('profiles').insert({ id: user.id });
            return;
        }

        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        }

    // Historique scores
    async function fetchScores() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('scores')
          .select('game_name, score, created_at')
          .eq('user_id', user.id)
          .order('score', { ascending: false });

        if (error) throw error;

        setScores(data || []);

        if (data?.length > 0) {
          const max = data[0].score; // déjà trié descendant
          const avg = data.reduce((sum, s) => sum + s.score, 0) / data.length;
          setBestScore(max);
          setAverageScore(Math.round(avg));

          const byGame = data.reduce((acc, s) => {
            acc[s.game_name] = (acc[s.game_name] || 0) + 1;
            return acc;
          }, {});
          setGamesPlayedByType(byGame);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    fetchScores();
  }, [user]);

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Sauvegarder l'URL dans profiles
      await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: publicUrl });

      setAvatarUrl(publicUrl);
      alert('Avatar mis à jour !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Effacer tout l\'historique ?')) return;

    try {
      await supabase.from('scores').delete().eq('user_id', user.id);
      setScores([]);
      setBestScore(0);
      setAverageScore(0);
      setGamesPlayedByType({});
      alert('Historique effacé.');
    } catch (err) {
      alert('Erreur.');
    }
  };

  const shareOnX = () => {
    const text = `Je joue à MACHINE À HITS 80s et j'ai scoré ${bestScore} points ! À toi de jouer ? #80sHits #BlindTest`;
    const url = `${window.location.origin}/profile`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="text-center py-40 text-3xl text-gray-300">
        Vous devez être connecté pour voir votre profil.
        <Link to="/login" className="block mt-6 text-neon-blue underline text-2xl hover:text-neon-pink">
          Se connecter →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header profil */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-purple via-neon-pink to-neon-blue animate-pulse-slow blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="relative w-full h-full rounded-full object-cover border-4 border-neon-blue/50 shadow-[0_0_40px_rgba(0,255,255,0.4)] group-hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] transition-shadow"
              />
            ) : (
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-6xl md:text-8xl font-black text-white shadow-[0_0_40px_rgba(147,51,234,0.7)] group-hover:shadow-[0_0_60px_rgba(147,51,234,0.9)] transition-shadow border-4 border-neon-blue/50">
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}

            <label className="absolute bottom-0 right-0 bg-neon-blue text-black p-3 rounded-full cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? 'Upload...' : '📷'}
            </label>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold neon-text mb-4 tracking-wider">
            {user.email?.split('@')[0]}
          </h1>

          <p className="text-xl text-gray-400 mb-4">
            Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard title="Défis terminés" value={completedChallenges} color="neon-green" icon="🏆" badge={completedChallenges >= 5 ? "Vétéran !" : null} />
          <StatCard title="Meilleur score" value={bestScore.toLocaleString()} color="neon-pink" icon="⭐" />
          <StatCard title="Score moyen" value={averageScore.toLocaleString()} color="neon-yellow" icon="📊" />
          <StatCard title="Parties jouées" value={scores.length} color="neon-blue" icon="🎮" />
        </div>

        {/* Top 5 scores */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-green mb-8 text-center neon-text">
            Top 5 scores
          </h2>

          {scores.length === 0 ? (
            <p className="text-center text-xl text-gray-400">Pas encore de scores...</p>
          ) : (
            <div className="space-y-4">
              {scores.slice(0, 5).map((s, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900/70 p-6 rounded-2xl border border-neon-blue/30 flex justify-between items-center hover:bg-gray-800/70 transition-colors"
                >
                  <div>
                    <span className="text-xl font-bold text-white">#{idx + 1}</span>
                    <span className="ml-4 text-neon-pink">{s.game_name}</span>
                  </div>
                  <span className="text-2xl font-bold text-neon-green">{s.score.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique complet */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-pink mb-8 text-center neon-text">
            Historique complet
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-16 text-xl text-gray-400 bg-gray-900/60 rounded-3xl border border-neon-blue/30">
              Pas encore de parties jouées...
            </div>
          ) : (
            <div className="bg-gray-950/80 rounded-3xl overflow-hidden border border-neon-blue/40 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
              <table className="w-full text-left">
                <thead className="bg-black/70">
                  <tr>
                    <th className="p-6 text-neon-green font-bold">Jeu</th>
                    <th className="p-6 text-neon-green font-bold text-right">Score</th>
                    <th className="p-6 text-neon-green font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((entry, idx) => (
                    <tr key={idx} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="p-6 font-medium text-white">{entry.game_name}</td>
                      <td className="p-6 text-right font-bold text-neon-pink">{entry.score.toLocaleString()} pts</td>
                      <td className="p-6 text-right text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/challenges"
            className="inline-block bg-gradient-to-r from-neon-blue to-cyan-500 text-black font-bold py-5 px-12 rounded-2xl text-xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all transform hover:scale-105"
          >
            Jouer un défi →
          </Link>

          <button
            onClick={handleClearHistory}
            className="inline-block bg-gradient-to-r from-red-600/80 to-rose-700/80 text-white font-bold py-5 px-12 rounded-2xl text-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105"
          >
            Effacer mon historique
          </button>

          <button
            onClick={signOut}
            className="inline-block bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold py-5 px-12 rounded-2xl text-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant StatCard réutilisable
function StatCard({ title, value, color, icon, badge }) {
  return (
    <div className="bg-gray-900/70 p-6 rounded-3xl border border-neon-blue/40 text-center shadow-[0_0_25px_rgba(0,255,255,0.15)] transform hover:scale-105 transition-transform">
      <div className="text-6xl mb-4">{icon}</div>
      <p className={`text-5xl font-bold text-${color} mb-2`}>{value}</p>
      <p className="text-xl text-gray-300">{title}</p>
      {badge && <span className="mt-3 inline-block px-4 py-1 bg-neon-yellow/20 text-neon-yellow rounded-full text-sm border border-neon-yellow/40">{badge}</span>}
    </div>
  );
}