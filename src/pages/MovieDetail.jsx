// src/pages/MovieDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPublicImageUrl } from '../lib/storage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('movies_series')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setMovie(data);
      } catch (err) {
        console.error('Erreur lors du chargement du film/série:', err);
        setError('Film ou série non trouvé.');
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  if (loading) return <LoadingSpinner message="Chargement de la fiche culte..." color="neon-purple" />;
  
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <h2 className="text-4xl font-bold text-red-400 mb-6">404 - Signal perdu</h2>
          <p className="text-xl text-gray-400 mb-8">{error || 'Film ou série non trouvé.'}</p>
          <Link 
            to="/movies" 
            className="inline-block bg-neon-blue text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all"
          >
            ← Retour aux films & séries
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = movie.image_path ? getPublicImageUrl(movie.image_path) : null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Background Effect */}
      <div className="relative h-96 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#a855f720_0%,transparent_70%)]" />
        
        {imageUrl && (
          <img
            src={imageUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10">
        <Link 
          to="/movies" 
          className="inline-flex items-center gap-3 text-neon-blue hover:text-white mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour aux films & séries des années 80
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Image principale */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden border-2 border-neon-purple/40 shadow-2xl shadow-neon-purple/20">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-video bg-gray-950 flex items-center justify-center text-[180px] opacity-70">
                  🎬
                </div>
              )}
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-neon-purple/20 text-neon-purple px-5 py-2 rounded-full text-sm font-bold tracking-wider">
                {movie.type === 'film' ? 'FILM' : 'SÉRIE'}
              </span>
              <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium">
                {movie.year}
              </span>
              {movie.duration_min && (
                <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium">
                  {movie.duration_min} min
                </span>
              )}
            </div>

            {/* Titre */}
            <div>
              <h1 className="text-6xl md:text-7xl font-bold neon-text leading-none tracking-tighter mb-4">
                {movie.title}
              </h1>
              <p className="text-3xl text-neon-pink">par {movie.director}</p>
            </div>

            {/* Acteurs */}
            {movie.actors && (
              <div>
                <p className="text-gray-400 mb-2 text-lg">Avec</p>
                <p className="text-xl leading-relaxed text-white">
                  {movie.actors}
                </p>
              </div>
            )}

            {/* Infos secondaires */}
            <div className="grid grid-cols-2 gap-6 text-lg">
              {movie.country && (
                <div>
                  <span className="text-gray-400 block text-sm">Pays</span>
                  <span className="font-medium">{movie.country}</span>
                </div>
              )}
              {movie.duration_min && (
                <div>
                  <span className="text-gray-400 block text-sm">Durée</span>
                  <span className="font-medium">{movie.duration_min} minutes</span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            {movie.synopsis && (
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-2xl font-bold text-neon-green mb-5 flex items-center gap-3">
                  <span className="text-3xl">📜</span> SYNOPSIS
                </h3>
                <p className="text-gray-300 leading-relaxed text-[17px]">
                  {movie.synopsis}
                </p>
              </div>
            )}

            {/* Tags */}
            {movie.tags && movie.tags.length > 0 && (
              <div className="pt-6">
                <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-3">TAGS</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-900 border border-neon-blue/30 text-neon-blue px-4 py-1.5 rounded-full text-xs font-medium"
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