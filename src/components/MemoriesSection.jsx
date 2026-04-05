// src/components/MemoriesSection.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function MemoriesSection({ hitId }) {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Charger les souvenirs
  useEffect(() => {
    async function fetchMemories() {
      try {
        setLoading(true);
        let query = supabase
          .from('memories')
          .select('*')
          .eq('hit_id', hitId)
          .order('created_at', { ascending: false });

        // Si connecté, on voit aussi ses propres souvenirs non approuvés
        if (user) {
          query = query.or(`approved.eq.true,user_id.eq.${user.id}`);
        } else {
          query = query.eq('approved', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        setMemories(data || []);
      } catch (err) {
        console.error('Erreur chargement souvenirs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMemories();
  }, [hitId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Connecte-toi pour laisser un souvenir !');
      return;
    }
    if (!newMemory.trim() || newMemory.length > 280) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('memories')
        .insert({
          hit_id: hitId,
          user_id: user.id,
          text: newMemory.trim(),
          approved: false, // en attente de modération
        });

      if (error) throw error;

      setNewMemory('');
      alert('Souvenir ajouté ! Il apparaîtra une fois approuvé.');
    } catch (err) {
      setError('Erreur lors de l’envoi : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold neon-text text-center mb-10">
        Où étais-tu quand ce tube passait en boucle ?
      </h2>

      {/* Formulaire d’ajout */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-gray-900/60 p-8 rounded-2xl border border-neon-pink/40">
          <textarea
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            maxLength={280}
            placeholder="J’avais 16 ans, j’étais au lycée avec mon walkman... raconte ton souvenir !"
            className="w-full p-5 bg-black border border-neon-blue/50 rounded-xl text-white resize-none h-32 focus:outline-none focus:border-neon-pink"
            required
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-400">
              {newMemory.length} / 280
            </span>
            <button
              type="submit"
              disabled={submitting || !newMemory.trim()}
              className="bg-neon-pink text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(255,0,255,0.6)] disabled:opacity-50 transition-all"
            >
              {submitting ? 'Envoi...' : 'Partager mon souvenir'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </form>
      ) : (
        <p className="text-center text-xl text-gray-400 mb-12">
          Connecte-toi pour partager ton propre souvenir nostalgique !
        </p>
      )}

      {/* Liste des souvenirs */}
      {loading ? (
        <div className="text-center py-12">Chargement des souvenirs...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xl">
          Personne n’a encore partagé de souvenir pour ce hit... sois le premier !
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-neon-blue/30 hover:border-neon-pink/60 transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            >
              <p className="text-lg leading-relaxed text-gray-200 mb-4 italic">
                “{memory.text}”
              </p>
              <div className="flex justify-between items-center text-sm opacity-70">
                <span>
                  {new Date(memory.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {memory.user_id === user?.id && !memory.approved && (
                  <span className="text-yellow-400 text-xs font-bold">En attente d’approbation</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}