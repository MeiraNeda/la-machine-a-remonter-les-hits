// src/pages/BooksPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataRefresh } from '../context/DataRefreshContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';

const ITEMS_PER_PAGE = 12;

export default function BooksPage() {
  const { refreshTrigger } = useDataRefresh();

  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des romans
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('year', { ascending: false });

        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        console.error('Erreur chargement romans:', err);
        setError('Impossible de charger les romans pour le moment.');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [refreshTrigger]);

  // Gestion de la suppression
  const handleDelete = (id) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  // Filtrage
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(book =>
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term)
      );
    }

    if (selectedYear) {
      result = result.filter(book => book.year === parseInt(selectedYear));
    }

    if (selectedGenre) {
      result = result.filter(book => book.genre === selectedGenre);
    }

    return result;
  }, [books, searchTerm, selectedYear, selectedGenre]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedGenre]);

  const availableYears = useMemo(() => {
    return [...new Set(books.map(b => b.year))].sort((a, b) => b - a);
  }, [books]);

  const availableGenres = useMemo(() => {
    return [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
  }, [books]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedGenre('');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#a855f710_0%,transparent_70%)]" />

        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold neon-text mb-6 tracking-wider">
            ROMANS DES<br />ANNÉES 80
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-12">
            Les grands romans qui ont marqué la littérature des années 80 :<br />
            dystopies, thrillers, science-fiction et classiques intemporels.
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
            placeholder="Rechercher un titre ou un auteur..."
            className="flex-1 p-5 bg-black/90 border-2 border-neon-purple/50 rounded-3xl text-white placeholder-gray-400 focus:border-neon-pink focus:ring-4 focus:ring-neon-pink/30"
          />

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-black/80 border border-neon-purple/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Toutes les années</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-black/80 border border-neon-purple/50 rounded-2xl px-6 py-4 text-white focus:border-neon-pink"
          >
            <option value="">Tous les genres</option>
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {(searchTerm || selectedYear || selectedGenre) && (
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
          <p className="text-3xl text-neon-purple font-bold">
            {books.length} roman{books.length > 1 ? 's' : ''} des années 80
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement des romans cultes..." color="neon-purple" />
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-xl">{error}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-2xl">
            Aucun roman ne correspond à tes filtres.
            <button onClick={clearFilters} className="block mx-auto mt-6 text-neon-pink hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
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
            className="inline-block bg-neon-purple text-black font-bold py-5 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}