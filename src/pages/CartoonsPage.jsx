// src/pages/CartoonsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataRefresh } from '../context/DataRefreshContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CartoonCard from '../components/CartoonCard';

const ITEMS_PER_PAGE = 12;

export default function CartoonsPage() {
  const { refreshTrigger } = useDataRefresh();

  const [cartoons, setCartoons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des dessins animés
  useEffect(() => {
    async function fetchCartoons() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('cartoons')
          .select('*')
          .order('year', { ascending: false });

        if (error) throw error;
        setCartoons(data || []);
      } catch (err) {
        console.error('Erreur chargement dessins animés:', err);
        setError('Impossible de charger les dessins animés pour le moment.');
      } finally {
        setLoading(false);
      }
    }

    fetchCartoons();
  }, [refreshTrigger]);

  // Gestion de la suppression
  const handleDelete = (id) => {
    setCartoons(prev => prev.filter(cartoon => cartoon.id !== id));
  };

  // Filtrage
  const filteredCartoons = useMemo(() => {
    let result = [...cartoons];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(cartoon =>
        cartoon.title?.toLowerCase().includes(term) ||
        cartoon.studio?.toLowerCase().includes(term) ||
        cartoon.original_title?.toLowerCase().includes(term)
      );
    }

    if (selectedYear) {
      result = result.filter(cartoon => cartoon.year === parseInt(selectedYear));
    }

    if (selectedType) {
      result = result.filter(cartoon => cartoon.type === selectedType);
    }

    return result;
  }, [cartoons, searchTerm, selectedYear, selectedType]);

  const totalPages = Math.ceil(filteredCartoons.length / ITEMS_PER_PAGE);
  const paginatedCartoons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCartoons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCartoons, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedType]);

  const availableYears = useMemo(() => {
    return [...new Set(cartoons.map(c => c.year))].sort((a, b) => b - a);
  }, [cartoons]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedType('');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#22d3ee30_0%,transparent_70%)]" />

        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold neon-text mb-6 tracking-wider">
            DESSINS ANIMÉS<br />DES ANNÉES 80
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-12">
            Les séries et films animés qui ont marqué notre enfance :<br />
            robots, princesses, aventures et nostalgie pure !
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filtres */}
        <div className="max-w-3xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un dessin animé, studio ou titre original..."
            className="flex-1 p-5 bg-black/90 border-2 border-neon-cyan/50 rounded-3xl text-white placeholder-gray-400 focus:border-neon-pink focus:ring-4 focus:ring-neon-pink/30"
          />

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-black/80 border border-neon-cyan/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Toutes les années</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-black/80 border border-neon-cyan/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Tous les formats</option>
            <option value="serie">Séries</option>
            <option value="film">Films Animés</option>
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
          <p className="text-3xl text-neon-cyan font-bold">
            {cartoons.length} dessin{cartoons.length > 1 ? 's' : ''} animé{cartoons.length > 1 ? 's' : ''} des années 80
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement des dessins animés cultes..." color="neon-cyan" />
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-xl">{error}</div>
        ) : filteredCartoons.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-2xl">
            Aucun dessin animé ne correspond à tes filtres.
            <button onClick={clearFilters} className="block mx-auto mt-6 text-neon-pink hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedCartoons.map((cartoon) => (
                <CartoonCard 
                  key={cartoon.id} 
                  cartoon={cartoon} 
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
            className="inline-block bg-neon-cyan text-black font-bold py-5 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}