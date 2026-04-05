// src/pages/Home.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import HitCard from '../components/HitCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDataRefresh } from '../context/DataRefreshContext';

const HITS_PER_PAGE = 12;

export default function Home() {
  const { user } = useAuth();
  const { refreshTrigger } = useDataRefresh(); // Garde cette ligne si tu l'utilises ailleurs

  const [hits, setHits] = useState([]);
  const [filteredHits, setFilteredHits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === REAL-TIME : Écoute des changements dans la table 'hits' ===
  useEffect(() => {
    // Charger les hits initialement
    async function fetchHits() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hits')
          .select('*')
          .order('year', { ascending: false });

        if (error) throw error;
        setHits(data || []);
      } catch (err) {
        console.error('Erreur chargement hits:', err);
        setError('Impossible de charger les hits');
      } finally {
        setLoading(false);
      }
    }

    fetchHits();

    // Abonnement Real-time
    const subscription = supabase
      .channel('hits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hits' },
        (payload) => {
          console.log('Changement détecté dans hits:', payload);
          fetchHits(); // Recharger les hits à chaque changement
        }
      )
      .subscribe();

    // Nettoyage à la fermeture
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filtrage combiné
  const filteredAndSortedHits = useMemo(() => {
    let result = [...hits];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(hit =>
        hit.title?.toLowerCase().includes(term) ||
        hit.artist?.toLowerCase().includes(term) ||
        hit.year?.toString().includes(term)
      );
    }

    if (selectedYear) {
      result = result.filter(hit => hit.year === parseInt(selectedYear));
    }

    if (selectedCountry) {
      result = result.filter(hit => hit.country === selectedCountry);
    }

    return result;
  }, [hits, searchTerm, selectedYear, selectedCountry]);

  const totalPages = Math.ceil(filteredAndSortedHits.length / HITS_PER_PAGE);
  const paginatedHits = useMemo(() => {
    const start = (currentPage - 1) * HITS_PER_PAGE;
    return filteredAndSortedHits.slice(start, start + HITS_PER_PAGE);
  }, [filteredAndSortedHits, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedCountry]);

  const clearSearch = () => setSearchTerm('');
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedCountry('');
  };

  const availableYears = useMemo(() => {
    return [...new Set(hits.map(h => h.year))].sort((a, b) => b - a);
  }, [hits]);

  const availableCountries = useMemo(() => {
    return [...new Set(hits.map(h => h.country).filter(Boolean))].sort();
  }, [hits]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) end = 5;
    if (currentPage >= totalPages - 2) start = totalPages - 4;

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* HERO SECTION */}
      <div className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff00ff10_0%,transparent_70%)]" />

        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold neon-text mb-6 tracking-[0.05em] animate-pulse-slow">
            LA MACHINE À REMONTER<br />LES HITS
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Revivez la naissance des plus grands tubes des années 80.<br />
            Histoires secrètes • Clips iconiques • Quizzes nostalgiques
          </p>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-14 relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un titre, artiste ou année..."
                className="w-full p-7 pr-16 bg-black/90 border-2 border-neon-blue/50 rounded-3xl text-white placeholder-gray-400 text-xl focus:outline-none focus:border-neon-pink focus:ring-4 focus:ring-neon-pink/30 shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-300"
              />
              <div className="absolute right-7 top-1/2 -translate-y-1/2 text-3xl text-neon-blue animate-pulse">🔍</div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-pink text-2xl transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row gap-4 justify-center">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-black/80 border border-neon-blue/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink transition-all"
            >
              <option value="">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-black/80 border border-neon-blue/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink transition-all"
            >
              <option value="">Tous les pays</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            {(selectedYear || selectedCountry || searchTerm) && (
              <button onClick={clearFilters} className="text-neon-pink hover:text-white font-medium px-6 py-4">
                Réinitialiser
              </button>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap justify-center gap-6">
            {user ? (
              <Link
                to="/admin"
                className="bg-gradient-to-r from-neon-pink to-neon-blue text-black font-bold py-6 px-12 rounded-2xl text-xl hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] transition-all transform hover:scale-105"
              >
                👑 Ajouter un hit
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-neon-green text-black font-bold py-6 px-12 rounded-2xl text-xl hover:shadow-[0_0_40px_rgba(0,255,0,0.5)] transition-all transform hover:scale-105"
              >
                🔑 Se connecter
              </Link>
            )}

            <Link
              to="/game/quick"
              className="bg-gradient-to-r from-neon-green to-emerald-500 text-black font-bold py-6 px-12 rounded-2xl text-xl hover:shadow-[0_0_40px_rgba(0,255,0,0.6)] transition-all transform hover:scale-105"
            >
              🎮 Blind Test Express
            </Link>
          </div>
        </div>
      </div>

      {/* Section principale avec liste des hits */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold neon-text mb-4">
            Les hits déjà dans la machine
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-3xl">
            <p className="text-neon-green font-bold">
              {hits.length} tube{hits.length > 1 ? 's' : ''} au total
            </p>
            {filteredAndSortedHits.length !== hits.length && (
              <p className="text-neon-pink">
                — {filteredAndSortedHits.length} affiché{filteredAndSortedHits.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement des tubes mythiques..." color="neon-pink" />
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-xl">{error}</div>
        ) : filteredAndSortedHits.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-2xl">
            Aucun hit ne correspond à tes filtres.
            <button onClick={clearFilters} className="block mx-auto mt-6 text-neon-pink hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedHits.map((hit) => (
                <HitCard 
                  key={hit.id} 
                  hit={hit} 
                  onDelete={(deletedId) => setHits(prev => prev.filter(h => h.id !== deletedId))}
                  onEdit={(editedId, updatedHit) => {
                    setHits(prev => prev.map(h => h.id === editedId ? { ...h, ...updatedHit } : h));
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-8 py-4 bg-gray-900 rounded-2xl border border-neon-blue/50 disabled:opacity-50 hover:bg-gray-800 transition-all"
                >
                  ← Précédent
                </button>

                <div className="flex gap-3">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={idx} className="px-5 py-4 text-gray-500">…</span>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`px-6 py-4 rounded-2xl font-bold transition-all min-w-[52px] ${
                          currentPage === page
                            ? 'bg-neon-pink text-black shadow-[0_0_25px_rgba(255,0,255,0.6)]'
                            : 'bg-gray-900 border border-neon-blue/50 hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-8 py-4 bg-gray-900 rounded-2xl border border-neon-blue/50 disabled:opacity-50 hover:bg-gray-800 transition-all"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}