// src/pages/MoviesSeriesPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataRefresh } from '../context/DataRefreshContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieCard from '../components/MovieCard';

const ITEMS_PER_PAGE = 12;

export default function MoviesSeriesPage() {
  const { refreshTrigger } = useDataRefresh();

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des films/séries
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('movies_series')
          .select('*')
          .order('year', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        console.error('Erreur chargement films/séries:', err);
        setError('Impossible de charger les films et séries pour le moment.');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [refreshTrigger]);

  // Gestion de la suppression
  const handleDelete = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Filtrage
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.director?.toLowerCase().includes(term) ||
        (item.actors && item.actors.toLowerCase().includes(term))
      );
    }

    if (selectedYear) {
      result = result.filter(item => item.year === parseInt(selectedYear));
    }

    if (selectedType) {
      result = result.filter(item => item.type === selectedType);
    }

    return result;
  }, [items, searchTerm, selectedYear, selectedType]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedType]);

  const availableYears = useMemo(() => {
    return [...new Set(items.map(i => i.year))].sort((a, b) => b - a);
  }, [items]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedType('');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00ffcc10_0%,transparent_70%)]" />

        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold neon-text mb-6 tracking-wider">
            LES FILMS & SÉRIES<br />DES ANNÉES 80
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-12">
            Blockbusters, classiques cultes, séries mythiques…<br />
            Retour vers le futur et bien plus !
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filtres */}
        <div className="max-w-3xl mx-auto mb-12 flex flex-col md:flex-row gap-4 justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un titre, réalisateur ou acteur..."
            className="flex-1 p-5 bg-black/90 border-2 border-neon-blue/50 rounded-3xl text-white placeholder-gray-400 focus:border-neon-pink focus:ring-4 focus:ring-neon-pink/30"
          />

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-black/80 border border-neon-blue/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Toutes les années</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-black/80 border border-neon-blue/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Tous les formats</option>
            <option value="film">Films</option>
            <option value="serie">Séries</option>
          </select>

          {(searchTerm || selectedYear || selectedType) && (
            <button
              onClick={clearFilters}
              className="text-neon-pink hover:text-white font-medium px-6 py-4 whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Compteur */}
        <div className="text-center mb-10">
          <p className="text-3xl text-neon-green font-bold">
            {items.length} film{items.length !== 1 ? 's' : ''} & série{items.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement des films & séries cultes..." color="neon-purple" />
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-xl">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-2xl">
            Aucun résultat pour tes filtres.
            <button onClick={clearFilters} className="block mx-auto mt-6 text-neon-pink hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedItems.map((item) => (
                <MovieCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-lg">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-block bg-neon-blue text-black font-bold py-5 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}