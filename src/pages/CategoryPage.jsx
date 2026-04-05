// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import HitCard from '../components/HitCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDataRefresh } from '../context/DataRefreshContext'; // ← import ajouté

const categoryConfig = {
  french: {
    title: "Tubes français des années 80",
    filter: { country: 'France' },
    emoji: '🇫🇷',
    description: 'Les plus grands succès chantés en français ou venus de France'
  },
  american: {
    title: "Hits américains des années 80",
    filter: { country: { in: ['USA', 'United States', 'US', 'États-Unis', 'america', 'Etats-Unis', 'U.S.A.', 'U.S.'] } },
    emoji: '🇺🇸',
    description: 'Les classiques made in USA qui ont marqué MTV et les charts'
  },
  british: {
    title: "Tubes britanniques des années 80",
    filter: { country: { in: ['United Kingdom', 'UK', 'England', 'Angleterre', 'british', 'U.K.', 'GB'] } },
    emoji: '🇬🇧',
    description: 'New wave, synthpop et rock venus du Royaume-Uni'
  },
  other: {
    title: "Autres tubes 80s du monde entier",
    filter: {
      or: [
        { country: { notIn: [
          'France', 'france', 'FR', 'Fr',
          'USA', 'United States', 'US', 'États-Unis', 'america', 'Etats-Unis', 'U.S.A.', 'U.S.', 'United States of America',
          'United Kingdom', 'UK', 'England', 'Angleterre', 'british', 'U.K.', 'GB', 'Great Britain'
        ]}},
        { country: { is: null } }
      ]
    },
    emoji: '🌍',
    description: 'Suède, Allemagne, Australie, Italie, Japon, Norvège… et tous les hits sans pays précisé !'
  }
};

export default function CategoryPage() {
  const { category } = useParams();
  const config = categoryConfig[category] || { title: 'Catégorie inconnue', filter: {} };

  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    async function fetchCategoryHits() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('hits')
          .select('id, title, artist, year, image_path, country')
          .order('year', { ascending: false })
          .limit(80);

        // Filtres serveur pour catégories ciblées
        if (category === 'french') {
          query = query.eq('country', 'France');
        } else if (category === 'american') {
          query = query.in('country', config.filter.country.in);
        } else if (category === 'british') {
          query = query.in('country', config.filter.country.in);
        }
        // "other" → pas de filtre serveur strict → on filtre client-side

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        let filtered = data || [];

        if (category === 'other') {
          filtered = filtered.filter(hit => {
            const c = (hit.country || '')
              .toLowerCase()
              .replace(/\./g, '')   // supprime les points (ex: U.S.A.)
              .trim();

            return (
              !c.includes('france') &&
              !c.includes('usa') &&
              !c.includes('united states') &&
              !c.includes('us') &&
              !c.includes('united kingdom') &&
              !c.includes('uk') &&
              !c.includes('england')
            );
          });
        }

        setHits(filtered);
      } catch (err) {
        console.error('Erreur détaillée :', err);
        setError('Erreur de chargement – regarde la console pour plus d’infos');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryHits();
  }, [category, refreshTrigger]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold neon-text mb-4">
            {config.emoji} {config.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {config.description}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message={`Chargement des ${config.title.toLowerCase()}...`} color="neon-purple" />
        ) : error ? (
          <div className="text-center text-red-400 text-2xl py-12">{error}</div>
        ) : hits.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-12">
            Aucun tube trouvé dans cette catégorie pour le moment…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {hits.map((hit) => (
              <HitCard key={hit.id} hit={hit} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-block bg-neon-blue text-black font-bold py-5 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}