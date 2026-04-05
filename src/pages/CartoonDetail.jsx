// src/pages/CartoonDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPublicImageUrl } from '../lib/storage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartoonDetail() {
  const { id } = useParams();
  const [cartoon, setCartoon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [audioLoadError, setAudioLoadError] = useState(false);

  useEffect(() => {
    async function fetchCartoon() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cartoons')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCartoon(data);
        
        if (data.image_paths && data.image_paths.length > 0) {
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error('Erreur chargement cartoon:', err);
        setError('Dessin animé non trouvé.');
      } finally {
        setLoading(false);
      }
    }

    fetchCartoon();
  }, [id]);

  if (loading) return <LoadingSpinner message="Chargement de la fiche..." color="neon-cyan" />;
  
  if (error || !cartoon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <h2 className="text-4xl font-bold text-red-400 mb-6">Signal perdu dans le ciel...</h2>
          <p className="text-xl text-gray-400 mb-8">{error || 'Dessin animé non trouvé.'}</p>
          <Link 
            to="/cartoons" 
            className="inline-block bg-neon-cyan text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all"
          >
            ← Retour aux dessins animés
          </Link>
        </div>
      </div>
    );
  }

  const mainImageUrl = cartoon.image_paths && cartoon.image_paths.length > 0 
    ? getPublicImageUrl(cartoon.image_paths[selectedImageIndex]) 
    : (cartoon.image_path ? getPublicImageUrl(cartoon.image_path) : null);

  // Correction : Construction manuelle de l'URL audio pour forcer le bucket "audio"
  const audioUrl = cartoon.audio_path 
    ? `https://fliytaqewdpuxzyijeca.supabase.co/storage/v1/object/public/audio/${cartoon.audio_path}`
    : null;

  console.log("🎵 Audio URL finale :", audioUrl);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Background */}
      <div className="relative h-96 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#22d3ee40_0%,transparent_70%)]" />
        {mainImageUrl && (
          <img
            src={mainImageUrl}
            alt={cartoon.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10">
        <Link 
          to="/cartoons" 
          className="inline-flex items-center gap-3 text-neon-cyan hover:text-white mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour aux dessins animés des années 80
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Galerie d'images */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl overflow-hidden border-2 border-neon-cyan/40 shadow-2xl shadow-neon-cyan/20">
              {mainImageUrl ? (
                <img 
                  src={mainImageUrl} 
                  alt={cartoon.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-video bg-gray-950 flex items-center justify-center text-[160px] opacity-70">
                  📺
                </div>
              )}
            </div>

            {cartoon.image_paths && cartoon.image_paths.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {cartoon.image_paths.map((path, index) => {
                  const thumbUrl = getPublicImageUrl(path);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex 
                          ? 'border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.6)]' 
                          : 'border-transparent hover:border-neon-cyan/50'
                      }`}
                    >
                      <img src={thumbUrl} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap gap-3">
              <span className="bg-neon-cyan/20 text-neon-cyan px-5 py-2 rounded-full text-sm font-bold tracking-wider">
                {cartoon.type === 'serie' ? 'SÉRIE ANIMÉE' : 'FILM ANIMÉ'}
              </span>
              <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium">
                {cartoon.year}
              </span>
              {cartoon.episodes && (
                <span className="bg-gray-800 px-5 py-2 rounded-full text-sm font-medium">
                  {cartoon.episodes} épisodes
                </span>
              )}
            </div>

            <div>
              <h1 className="text-6xl md:text-7xl font-bold neon-text leading-none tracking-tighter mb-4">
                {cartoon.title}
              </h1>
              {cartoon.original_title && cartoon.original_title !== cartoon.title && (
                <p className="text-2xl text-gray-400 italic">({cartoon.original_title})</p>
              )}
              {cartoon.studio && (
                <p className="text-3xl text-neon-pink mt-2">Studio : {cartoon.studio}</p>
              )}
            </div>

            {/* Player Audio avec diagnostic */}
            {audioUrl ? (
              <div className="bg-gray-900/80 border border-neon-cyan/30 rounded-3xl p-6">
                <p className="text-neon-cyan font-medium mb-3 flex items-center gap-2">
                  🎵 Chanson / Générique
                </p>
                <audio 
                  controls 
                  src={audioUrl} 
                  className="w-full accent-neon-cyan"
                  preload="metadata"
                  onError={(e) => {
                    console.error("Audio failed to load. URL:", audioUrl);
                    setAudioLoadError(true);
                  }}
                />
                {audioLoadError && (
                  <p className="text-red-400 text-sm mt-3">
                    ⚠️ Impossible de charger l’audio.<br />
                    Vérifie que le fichier est dans le bucket <strong>audio</strong> et que la policy publique est activée.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/80 border border-gray-700 rounded-3xl p-6 text-gray-400 text-center py-8">
                Aucun extrait audio disponible pour ce dessin animé.
              </div>
            )}

            {/* Reste du contenu */}
            <div className="grid grid-cols-2 gap-6 text-lg">
              {cartoon.country && (
                <div>
                  <span className="text-gray-400 block text-sm">Pays</span>
                  <span className="font-medium">{cartoon.country}</span>
                </div>
              )}
              {cartoon.episodes && (
                <div>
                  <span className="text-gray-400 block text-sm">Épisodes</span>
                  <span className="font-medium">{cartoon.episodes}</span>
                </div>
              )}
            </div>

            {cartoon.synopsis && (
              <div className="pt-8 border-t border-gray-700">
                <h3 className="text-2xl font-bold text-neon-green mb-5 flex items-center gap-3">
                  <span className="text-3xl">📜</span> SYNOPSIS
                </h3>
                <p className="text-gray-300 leading-relaxed text-[17px]">
                  {cartoon.synopsis}
                </p>
              </div>
            )}

            {cartoon.tags && cartoon.tags.length > 0 && (
              <div className="pt-6">
                <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-4">TAGS</h4>
                <div className="flex flex-wrap gap-2">
                  {cartoon.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-900 border border-neon-cyan/30 text-neon-cyan px-4 py-1.5 rounded-full text-xs font-medium"
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