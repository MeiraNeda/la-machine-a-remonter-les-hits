// src/components/ConnectionsExplorer.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/helpers';

export default function ConnectionsExplorer({ currentHit, allHits }) {
  const [manualConnections, setManualConnections] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // 1. Charger les connexions manuelles
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
        console.error('Erreur connexions manuelles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchManualConnections();
  }, [currentHit?.id]);

  // 2. Générer suggestions IA via Groq
  useEffect(() => {
    if (!currentHit || allHits.length < 4) return; // besoin d'au moins 4 hits pour avoir du sens

    const generateAISuggestions = async () => {
      setAiLoading(true);
      setAiError('');

      try {
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        if (!GROQ_API_KEY) throw new Error('Clé Groq manquante');

        const contextHits = allHits
          .filter(h => h.id !== currentHit.id)
          .slice(0, 20)
          .map(h => `${h.title} - ${h.artist} (${h.year})`)
          .join('\n');

        const prompt = `
Tu es un expert des hits des années 80.
Hit actuel : "${currentHit.title}" par ${currentHit.artist} (${currentHit.year}).

Autres hits disponibles :
${contextHits}

Propose entre 3 et 6 hits qui ont un lien fort avec celui-ci (même style, même année, même producteur, vibe similaire, clip MTV, influence, etc.).
Pour chaque suggestion :
- Le titre doit être EXACTEMENT celui d'un hit de la liste ci-dessus.
- Une raison courte (1 phrase maximum).

Réponds UNIQUEMENT avec un JSON valide, rien d'autre :

[
  {"title": "Titre exact", "reason": "Courte raison"},
  ...
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
            temperature: 0.65,
            max_tokens: 600,
          }),
        });

        if (!response.ok) throw new Error(`Groq erreur ${response.status}`);

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content?.trim() || '';

        if (!content) throw new Error("Réponse vide de Groq");

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          console.warn("Réponse Groq non-JSON :", content);
          throw new Error("Groq n'a pas renvoyé un JSON valide");
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          setAiSuggestions(parsed);
          console.log(`✅ ${parsed.length} suggestions IA générées`);
        } else {
          throw new Error("Aucune suggestion valide retournée");
        }

      } catch (err) {
        console.error('Erreur Groq suggestions:', err);
        setAiError(err.message || "Impossible de générer les suggestions pour le moment.");

        // Fallback : suggestions simples basées sur l'année et le pays
        generateSimpleFallbackSuggestions();
      } finally {
        setAiLoading(false);
      }
    };

    generateAISuggestions();
  }, [currentHit, allHits]);

  // Fallback si Groq échoue
  const generateSimpleFallbackSuggestions = () => {
    if (!currentHit || allHits.length === 0) return;

    const fallback = allHits
      .filter(h => h.id !== currentHit.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .map(hit => ({
        title: hit.title,
        reason: `Hit de ${hit.year} dans le même style 80s`
      }));

    setAiSuggestions(fallback);
    console.log("🔄 Suggestions fallback activées");
  };

  const renderConnectionCard = (hit, reason = '', type = '') => {
    if (!hit) return null;

    const imageUrl = hit.image_path ? getPublicUrl('images', hit.image_path) : null;

    return (
      <a
        href={`/hit/${hit.id}`}
        className="block bg-gray-900/70 rounded-xl overflow-hidden border border-neon-blue/40 hover:border-neon-pink/70 transition-all hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] group h-full"
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
          <div className="p-4 bg-black/60 border-t border-neon-blue/20 text-sm min-h-[64px]">
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

      {/* Suggestions IA */}
      {manualConnections.length === 0 && (
      <div>
        <h3 className="text-3xl font-bold text-neon-pink mb-8 text-center">
          {aiLoading ? 'Groq réfléchit à des connexions...' : 'Tu vas probablement adorer…'}
        </h3>

        {aiLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-neon-pink mx-auto mb-6" />
            <p className="text-gray-300">Analyse des connexions 80s en cours...</p>
          </div>
        ) : aiError ? (
          <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-3">Impossible de générer les suggestions IA</p>
            <p className="text-sm text-gray-400">{aiError}</p>
          </div>
        ) : aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiSuggestions.map((sugg, idx) => {
              const matchingHit = allHits.find(h =>
                h.title.toLowerCase().trim() === (sugg.title || '').toLowerCase().trim()
              );
              if (!matchingHit) return null;

              return (
                <div key={matchingHit.id || `ai-${idx}`} className="h-full">
                  {renderConnectionCard(matchingHit, sugg.reason, 'IA suggestion')}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-700">
            <p className="text-xl text-gray-400 mb-2">Pas encore de suggestions intelligentes</p>
            <p className="text-sm text-gray-500">
              Ajoute plus de hits dans l'admin pour permettre à Groq de trouver des connexions intéressantes.
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}