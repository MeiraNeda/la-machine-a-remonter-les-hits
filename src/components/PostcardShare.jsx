// src/components/PostcardShare.jsx
import { useRef } from 'react';
import { toPng } from 'html-to-image';

export default function PostcardShare({ hit, score = null, memory = '' }) {
  const cardRef = useRef(null);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `carte-80s-${hit.title}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur génération carte:', err);
      alert('Impossible de générer la carte pour le moment');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h3 className="text-3xl font-bold neon-text text-center mb-8">
        Crée ta Carte Postale 80s
      </h3>

      <div ref={cardRef} className="bg-white p-8 rounded-xl shadow-2xl border-8 border-yellow-400 relative">
        {/* Fond rétro */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=800')] bg-cover" />

        <div className="relative z-10 text-center">
          <h4 className="text-3xl font-bold text-purple-800 mb-4">{hit.title}</h4>
          <p className="text-xl text-gray-800 mb-6">{hit.artist} • {hit.year}</p>

          {score !== null && (
            <div className="mb-6">
              <p className="text-2xl font-bold text-red-600">Ton score</p>
              <p className="text-4xl font-extrabold text-purple-900">{score} pts</p>
            </div>
          )}

          {memory && (
            <div className="mb-8 italic text-gray-700 text-lg border-t border-gray-300 pt-4">
              “{memory}”
            </div>
          )}

          <p className="text-sm text-gray-600 mt-8">
            Généré par La Machine à Remonter les Hits – 80s Forever
          </p>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="mt-8 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold py-5 px-10 rounded-xl text-xl hover:shadow-[0_0_30px_rgba(255,165,0,0.7)] transition-all"
      >
        Télécharger ta Carte Postale 80s
      </button>
    </div>
  );
}