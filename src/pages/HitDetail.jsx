// src/pages/HitDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';
import { AVAILABLE_VOICES } from '../lib/tts';
import { playNarration, stopNarration } from '../lib/tts';

import StorySwiper from '../components/StorySwiper';
import Timeline from '../components/Timeline';
import MemoriesSection from '../components/MemoriesSection';
import ConnectionsExplorer from '../components/ConnectionsExplorer';
import WorldHitsMap from '../components/WorldHitsMap';
import UserProgress from '../components/UserProgress';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HitDetail() {
  const { id } = useParams();
  const [hit, setHit] = useState(null);
  const [allHits, setAllHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Narration TTS Groq
  const [selectedVoice, setSelectedVoice] = useState('autumn');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: hitData, error: hitError } = await supabase
          .from('hits')
          .select('*')
          .eq('id', id)
          .single();

        if (hitError) throw hitError;
        if (!hitData) throw new Error('Hit non trouvé');

        setHit(hitData);

        const { data: hitsData } = await supabase
          .from('hits')
          .select('id, title, artist, year, image_path, country')
          .neq('id', id);

        setAllHits(hitsData || []);
      } catch (err) {
        console.error('Erreur chargement :', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Fonction pour générer et jouer la narration
  const generateNarrationAudio = async (isPreview = false) => {
    if (!hit?.hidden_truth) return;

    setIsNarrating(true);
    setNarrationError(null);

    // Arrête toute narration en cours
    stopNarration();

    try {
      const narrationText = `Voici la vérité cachée derrière le hit "${hit.title}" de ${hit.artist}... ${hit.hidden_truth}`;

      await playNarration(narrationText, {
        voice: selectedVoice,
        speed: playbackSpeed,
        previewOnly: isPreview,
      });

      if (isPreview) {
        setNarrationError('Prévisualisation en cours...');
      }
    } catch (err) {
      console.error('Erreur narration:', err);
      setNarrationError(err.message || 'Impossible de générer la narration');
    } finally {
      setIsNarrating(false);
    }
  };

  const handlePreview = () => generateNarrationAudio(true);
  const handleFullPlay = () => generateNarrationAudio(false);

  // Fonction Stop
  const handleStopNarration = () => {
    stopNarration();
    setNarrationError(null);
  };

  if (loading) return <LoadingSpinner message="Chargement du tube mythique..." color="neon-blue" />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-10 bg-gray-900/80 rounded-2xl border border-red-600/50 max-w-lg mx-4">
        <h2 className="text-4xl font-bold text-red-400 mb-6 neon-text">Erreur</h2>
        <p className="text-xl text-gray-300">{error}</p>
        <Link 
          to="/" 
          className="inline-block mt-8 bg-neon-blue text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );

  if (!hit) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-10 bg-gray-900/80 rounded-2xl border border-neon-pink/50 max-w-lg mx-4">
        <h2 className="text-4xl font-bold text-neon-pink mb-6 neon-text">Hit introuvable</h2>
        <Link 
          to="/" 
          className="inline-block bg-neon-blue text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );

  const imageUrl = hit.image_path ? getPublicUrl('images', hit.image_path) : null;
  const audioUrl = hit.audio_path ? getPublicUrl('audio', hit.audio_path) : null;

  return (
    <div className="min-h-screen bg-black pb-20 relative">
      {/* Bouton retour fixe en haut à gauche */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-neon-blue hover:text-neon-pink p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] backdrop-blur-sm"
        title="Retour à l'accueil"
      >
        ←
      </Link>

      {/* Header avec cover */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${hit.title} cover`}
            className="w-full h-full object-cover brightness-50 scale-105 transition-transform duration-1000 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-pink opacity-40 animate-pulse-slow" />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
          <h1 className="text-4xl md:text-6xl font-bold neon-text mb-4 animate-pulse-slow tracking-wider">
            {hit.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 drop-shadow-lg">
            {hit.artist} • {hit.year}
          </p>
        </div>
      </div>

      {/* Extrait audio original */}
      {audioUrl && (
        <div className="p-6 bg-gray-950/70 border-b border-neon-blue/30">
          <h3 className="text-xl font-bold text-neon-green mb-4 text-center neon-text">
            Extrait original
          </h3>
          <audio 
            controls 
            src={audioUrl} 
            className="w-full max-w-2xl mx-auto block accent-neon-pink"
            onError={(e) => {
              console.error("❌ Erreur chargement audio :", audioUrl);
            }}
          >
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 space-y-16">
        {/* Vérité cachée + Narration enrichie */}
        {hit.hidden_truth ? (
          <div className="bg-gray-900/60 rounded-2xl p-8 border border-neon-pink/40 shadow-[0_0_30px_rgba(255,0,255,0.2)] hover:shadow-[0_0_50px_rgba(255,0,255,0.4)] transition-shadow duration-500">
            <h2 className="text-3xl font-bold neon-text mb-6 text-center animate-pulse-slow">
              La vérité derrière le hit
            </h2>

            <p className="text-lg leading-relaxed text-gray-200 mb-8 bg-black/40 p-6 rounded-xl border border-neon-pink/20">
              {hit.hidden_truth}
            </p>

            {/* Options voix & vitesse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-bold">Voix</label>
                <select
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                  className="w-full p-4 bg-black border border-neon-blue rounded-xl text-white focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50 transition-all"
                >
                  {AVAILABLE_VOICES.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-bold">Vitesse</label>
                <select
                  value={playbackSpeed}
                  onChange={e => setPlaybackSpeed(Number(e.target.value))}
                  className="w-full p-4 bg-black border border-neon-blue rounded-xl text-white focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50 transition-all"
                >
                  <option value={0.8}>Lente (0.8×)</option>
                  <option value={1.0}>Normale</option>
                  <option value={1.2}>Rapide (1.2×)</option>
                  <option value={1.5}>Très rapide (1.5×)</option>
                </select>
              </div>
            </div>

            {/* Boutons narration */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handlePreview}
                disabled={isNarrating}
                className="flex items-center gap-3 bg-gradient-to-r from-neon-green to-teal-500 text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,255,128,0.5)] disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {isNarrating ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                    Génération...
                  </>
                ) : 'Prévisualiser 10s'}
              </button>

              <button
                onClick={handleFullPlay}
                disabled={isNarrating}
                className="flex items-center gap-3 bg-gradient-to-r from-neon-pink to-neon-blue text-black font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {isNarrating ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                    Génération...
                  </>
                ) : 'Générer & écouter'}
              </button>

              <button
                onClick={handleStopNarration}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all"
              >
                Stop
              </button>
            </div>

            {narrationError && (
              <p className="text-red-400 text-center mb-6 font-medium bg-red-950/30 p-4 rounded-xl">
                {narrationError}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700">
            <p className="text-xl text-gray-500">
              Pas de vérité cachée enregistrée pour ce tube...
            </p>
          </div>
        )}

        {/* Timeline interactive */}
        {hit.timeline_events?.length > 0 && (
          <div className="bg-gray-900/40 rounded-2xl p-6 border border-neon-green/30 hover:border-neon-green/60 transition-all hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]">
            <Timeline events={hit.timeline_events} />
          </div>
        )}

        {/* Souvenirs utilisateurs */}
        <MemoriesSection hitId={hit.id} />

        {/* Connexions et recommandations Groq (UNIQUEMENT ICI) */}
        <ConnectionsExplorer currentHit={hit} allHits={allHits} />

        {/* Carte mondiale */}
        <WorldHitsMap hits={allHits} />

        {/* Stories swipeables */}
        {hit.story_chapters?.length > 0 && (
          <div className="bg-gray-900/40 rounded-2xl p-6 border border-neon-purple/30 hover:border-neon-purple/60 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]">
            <h2 className="text-3xl md:text-4xl font-bold text-center neon-text mb-8">
              Story musicale
            </h2>
            <StorySwiper chapters={hit.story_chapters} autoPlay={true} />
          </div>
        )}

        {/* Progression utilisateur (badges + streak) */}
        <div className="mt-16">
          <UserProgress />
        </div>
      </div>
    </div>
  );
}