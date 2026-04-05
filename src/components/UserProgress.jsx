// src/components/ConnectionsExplorer.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';

export default function ConnectionsExplorer({ currentHit, allHits }) {
  const [manualConnections, setManualConnections] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Charger les connexions manuelles depuis la base
  useEffect(() => {
    async function fetchManualConnections() {
      if (!currentHit?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hit_connections')
          .select(`
            id,
            connection_type,
            description,
            hit_id_to,
            hits!hit_id_to (id, title, artist, year, image_path)
          `)
          .eq('hit_id_from', currentHit.id);

        if (error) throw error;
        setManualConnections(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des connexions manuelles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchManualConnections();
  }, [currentHit?.id]);

  // Générer des suggestions IA via Groq
  useEffect(() => {
    if (!currentHit || allHits.length < 3 || aiSuggestions.length > 0) return;

    const generateAISuggestions = async () => {
      setAiLoading(true);

      try {
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        if (!GROQ_API_KEY) {
          throw new Error('Clé API Groq manquante dans les variables d\'environnement');
        }

        // Préparer le contexte des autres hits
        const contextHits = allHits
          .filter(h => h.id !== currentHit.id)
          .slice(0, 15)
          .map(h => `${h.title} - ${h.artist} (${h.year})`)
          .join('\n');

        const prompt = `
Tu es un expert des hits des années 80.
Voici le hit actuel : "${currentHit.title}" par ${currentHit.artist} (${currentHit.year}).

Voici d'autres hits disponibles dans la base :
${contextHits}

Propose 3 à 5 hits qui ont un lien fort avec celui-ci (même style, même année, même producteur, vibe similaire, clip culte, etc.).
Pour chaque suggestion, donne :
- Le titre exact (il doit correspondre exactement à un hit de la liste ci-dessus)
- Une courte raison (1 phrase maximum)

Réponds UNIQUEMENT au format JSON suivant, sans aucun texte supplémentaire avant ou après :

[
  {"title": "...", "reason": "..."},
  {"title": "...", "reason": "..."}
]
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur Groq : ${response.status}`);
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content?.trim() || '';

        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setAiSuggestions(parsed);
        } else {
          console.warn('Format de réponse Groq inattendu:', parsed);
        }
      } catch (err) {
        console.error('Erreur génération suggestions Groq:', err);
      } finally {
        setAiLoading(false);
      }
    };

    generateAISuggestions();
  }, [currentHit, allHits]);

  // Fonction pour rendre une carte de connexion
  const renderConnectionCard = (hit, reason = '', type = '') => {
    if (!hit) return null;

    const imageUrl = hit.image_path ? getPublicUrl('images', hit.image_path) : null;

    return (
      <a
        href={`/hit/${hit.id}`}
        className="block bg-gray-900/70 rounded-xl overflow-hidden border border-neon-blue/40 hover:border-neon-pink/70 transition-all hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] group"
      >
        <div className="relative aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={hit.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neon-blue/30 to-neon-pink/30 flex items-center justify-center text-6xl opacity-40">
              🎵
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="font-bold text-white group-hover:text-neon-pink transition-colors">
              {hit.title}
            </h4>
            <p className="text-sm text-gray-300">
              {hit.artist} · {hit.year}
            </p>
          </div>
        </div>

        {(reason || type) && (
          <div className="p-4 bg-black/60 border-t border-neon-blue/20 text-sm">
            {type && <span className="text-neon-green font-semibold">[{type}] </span>}
            {reason}
          </div>
        )}
      </a>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-4xl md:text-5xl font-bold neon-text text-center mb-12">
        Explore les connexions 80s
      </h2>

      {/* Connexions manuelles */}
      {manualConnections.length > 0 && (
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-neon-blue mb-8 text-center">
            Connexions déjà découvertes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {manualConnections.map((conn) => (
              <div key={conn.id || conn.hit_id_to} className="h-full">
                {renderConnectionCard(
                  conn.hits,
                  conn.description,
                  conn.connection_type?.replace('_', ' ') || ''
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions IA via Groq */}
      <div>
        <h3 className="text-3xl font-bold text-neon-pink mb-8 text-center">
          {aiLoading ? 'Groq réfléchit à des connexions...' : 'Tu vas probablement adorer…'}
        </h3>

        {aiLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-neon-pink mx-auto mb-6"></div>
            <p className="text-gray-300">Génération des recommandations 80s en cours...</p>
          </div>
        ) : aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiSuggestions.map((sugg, idx) => {
              const matchingHit = allHits.find(
                h => h.title.toLowerCase().trim() === sugg.title?.toLowerCase().trim()
              );
              if (!matchingHit) return null;

              return (
                <div key={matchingHit.id || `ai-sugg-${idx}`} className="h-full">
                  {renderConnectionCard(matchingHit, sugg.reason, 'IA suggestion')}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl py-8">
            Pas encore de suggestions intelligentes… revenez plus tard !
          </p>
        )}
      </div>
    </div>
  );
}