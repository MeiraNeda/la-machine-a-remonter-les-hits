// src/pages/BookDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPublicImageUrl } from '../lib/storage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBook(data);
      } catch (err) {
        console.error('Erreur lors du chargement du roman:', err);
        setError('Roman non trouvé.');
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  if (loading) return <LoadingSpinner message="Chargement de la fiche..." color="neon-yellow" />;
  
  if (error || !book) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <h2 className="text-4xl font-bold text-red-400 mb-6">Signal perdu dans les pages...</h2>
          <p className="text-xl text-gray-400 mb-8">{error || 'Roman non trouvé.'}</p>
          <Link 
            to="/books" 
            className="inline-block bg-neon-purple text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all"
          >
            ← Retour à la liste des romans
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = book.image_path ? getPublicImageUrl(book.image_path) : null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Background Effect */}
      <div className="relative h-96 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab30830_0%,transparent_70%)]" />
        
        {imageUrl && (
          <img
            src={imageUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10">
        <Link 
          to="/books" 
          className="inline-flex items-center gap-3 text-neon-purple hover:text-white mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour aux romans des années 80
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Couverture du livre */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden border-2 border-neon-yellow/40 shadow-2xl shadow-neon-yellow/20">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={book.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-[3/4] bg-gray-950 flex items-center justify-center text-[160px] opacity-70">
                  📖
                </div>
              )}
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-neon-yellow/20 text-neon-yellow px-5 py-2 rounded-full text-sm font-bold tracking-wider">
                {book.year}
              </span>
              {book.genre && (
                <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium border border-neon-yellow/20">
                  {book.genre}
                </span>
              )}
              {book.pages && (
                <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium">
                  {book.pages} pages
                </span>
              )}
            </div>

            {/* Titre et Auteur */}
            <div>
              <h1 className="text-6xl md:text-7xl font-bold neon-text leading-none tracking-tighter mb-4">
                {book.title}
              </h1>
              <p className="text-3xl text-neon-pink">par {book.author}</p>
            </div>

            {/* Infos secondaires */}
            {book.country && (
              <div>
                <span className="text-gray-400 block text-sm mb-1">Pays d'origine</span>
                <span className="text-xl font-medium">{book.country}</span>
              </div>
            )}

            {/* Synopsis */}
            {book.synopsis && (
              <div className="pt-8 border-t border-gray-700">
                <h3 className="text-2xl font-bold text-neon-green mb-5 flex items-center gap-3">
                  <span className="text-3xl">📜</span> RÉSUMÉ
                </h3>
                <p className="text-gray-300 leading-relaxed text-[17px]">
                  {book.synopsis}
                </p>
              </div>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className="pt-6">
                <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-4">TAGS</h4>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-900 border border-neon-yellow/30 text-neon-yellow px-4 py-1.5 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}