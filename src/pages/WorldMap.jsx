// src/pages/WorldMap.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import WorldHitsMap from '../components/WorldHitsMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function WorldMap() {
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllHits() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('hits')
          .select('id, title, artist, year, country, image_path')
          .not('country', 'is', null);

        if (error) throw error;

        setHits(data || []);
      } catch (err) {
        console.error('Erreur chargement hits pour carte:', err);
        setError('Impossible de charger les hits pour la carte mondiale');
      } finally {
        setLoading(false);
      }
    }

    fetchAllHits();
  }, []);

  return (
    <div className="min-h-screen bg-black relative">
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 bg-black/70 hover:bg-black/90 text-neon-blue hover:text-neon-pink p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] backdrop-blur-sm"
        title="Retour à l'accueil"
      >
        ← Accueil
      </Link>

      <div className="py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold neon-text mb-6 tracking-wider animate-pulse-slow">
            🌍 CARTE MONDIALE DES HITS 80s
          </h1>

          {loading ? (
            <LoadingSpinner message="Chargement des hits mondiaux..." color="neon-purple" />
          ) : error ? (
            <div className="text-red-400 text-2xl font-bold">{error}</div>
          ) : (
            <p className="text-2xl md:text-3xl text-neon-green font-bold mt-4">
              {hits.length} hit{hits.length !== 1 ? 's' : ''} placés sur la carte
            </p>
          )}
        </div>

        {!loading && !error && <WorldHitsMap hits={hits} />}
      </div>

      <p className="text-center text-sm text-gray-500 pb-8">
        Clique sur les vinyles pour découvrir l’histoire de chaque tube
      </p>
    </div>
  );
}