// src/components/HitCard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicUrl } from '../lib/helpers';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'hava.flne26@gmail.com';

export default function HitCard({ hit, onDelete, onEdit }) {
  const { user } = useAuth();

  const imageUrl = hit.image_path ? getPublicUrl('images', hit.image_path) : null;
  const audioUrl = hit.audio_path ? getPublicUrl('audio', hit.audio_path) : null;

  const fallbackImage = "https://via.placeholder.com/300x300/111/eee?text=80s+Hit";

  const isAdmin = user?.email === ADMIN_EMAIL;

  // État pour le modal d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: hit.title || '',
    artist: hit.artist || '',
    year: hit.year || 1985,
    country: hit.country || '',
    hidden_truth: hit.hidden_truth || '',
    tags: hit.tags ? hit.tags.join(', ') : '',
  });

  const [newImageFile, setNewImageFile] = useState(null);
  const [newAudioFile, setNewAudioFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(imageUrl);
  const [newAudioPreview, setNewAudioPreview] = useState(audioUrl);

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [tagsList, setTagsList] = useState(hit.tags || []);

  useEffect(() => {
    const newTags = editForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    setTagsList(newTags);
  }, [editForm.tags]);

  useEffect(() => {
    if (newImageFile) {
      const url = URL.createObjectURL(newImageFile);
      setNewImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewImagePreview(imageUrl);
    }
  }, [newImageFile, imageUrl]);

  useEffect(() => {
    if (newAudioFile) {
      const url = URL.createObjectURL(newAudioFile);
      setNewAudioPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewAudioPreview(audioUrl);
    }
  }, [newAudioFile, audioUrl]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Vraiment supprimer "${hit.title}" ?`)) return;

    try {
      const { error } = await supabase
        .from('hits')
        .delete()
        .eq('id', hit.id);

      if (error) throw error;

      alert('Hit supprimé avec succès !');
      if (onDelete) onDelete(hit.id);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      let updatedData = {
        title: editForm.title.trim(),
        artist: editForm.artist.trim(),
        year: Number(editForm.year),
        country: editForm.country.trim() || null,
        hidden_truth: editForm.hidden_truth.trim() || null,
        tags: tagsList.length ? tagsList : null,
      };

      if (newImageFile) {
        const imageExt = newImageFile.name.split('.').pop().toLowerCase();
        const imagePath = `hits/${crypto.randomUUID()}.${imageExt}`;
        const { error: imgErr } = await supabase.storage
          .from('images')
          .upload(imagePath, newImageFile, { upsert: true });
        if (imgErr) throw imgErr;
        updatedData.image_path = imagePath;
      }

      if (newAudioFile) {
        const audioExt = newAudioFile.name.split('.').pop().toLowerCase();
        const audioPath = `hits/${crypto.randomUUID()}.${audioExt}`;
        const { error: audioErr } = await supabase.storage
          .from('audio')
          .upload(audioPath, newAudioFile, { upsert: true });
        if (audioErr) throw audioErr;
        updatedData.audio_path = audioPath;
      }

      const { error } = await supabase
        .from('hits')
        .update(updatedData)
        .eq('id', hit.id);

      if (error) throw error;

      alert('Hit modifié avec succès !');
      setIsEditModalOpen(false);

      const updatedHit = { ...hit, ...updatedData };
      if (onEdit) onEdit(hit.id, updatedHit);

      setNewImageFile(null);
      setNewAudioFile(null);
    } catch (err) {
      console.error('Erreur modification:', err);
      setEditError(err.message || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Fermeture du modal avec Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsEditModalOpen(false);
    };
    if (isEditModalOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isEditModalOpen]);

  return (
    <>
      {/* ====================== HIT CARD ====================== */}
      <div className="relative group block bg-gray-900/80 rounded-3xl overflow-hidden border-2 border-neon-blue/30 hover:border-neon-pink transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,0,255,0.6)] hover:-translate-y-3">
        
        <Link to={`/hit/${hit.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-black">
            
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-neon-pink/80 rounded-3xl transition-all duration-500 z-10 pointer-events-none" />
            
            <img
              src={imageUrl || fallbackImage}
              alt={`${hit.title} - ${hit.artist}`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onError={(e) => { e.target.src = fallbackImage; }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/30 transition-all" />

            <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent_0px,transparent_3px,rgba(255,255,255,0.07)_3px,rgba(255,255,255,0.07)_6px)] opacity-30 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 to-transparent">
              <h3 className="text-2xl md:text-[26px] font-bold neon-text tracking-tight drop-shadow-[0_0_20px_rgba(255,0,255,0.9)] leading-tight mb-1 line-clamp-2">
                {hit.title}
              </h3>
              <p className="text-lg text-white/90 font-medium flex items-center gap-3">
                <span>{hit.artist}</span>
                <span className="text-neon-green text-xl">•</span>
                <span className="text-neon-green font-mono tracking-widest">{hit.year}</span>
              </p>
            </div>

            <div className="absolute top-6 left-6 bg-black/80 text-neon-green font-mono text-sm px-4 py-1.5 rounded-2xl border border-neon-green/50 shadow-[0_0_20px_rgba(0,255,100,0.5)]">
              {hit.year}
            </div>
          </div>

          {audioUrl && (
            <div className="p-5 bg-black border-t-2 border-neon-blue/30">
              <audio
                controls
                src={audioUrl}
                preload="none"
                className="w-full accent-neon-pink"
              >
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>
          )}
        </Link>

        {/* Boutons Admin */}
        {isAdmin && (
          <div className="absolute top-6 right-6 flex flex-col gap-4 z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="bg-gradient-to-br from-neon-blue to-cyan-400 text-black font-bold w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.8)] hover:shadow-[0_0_50px_rgba(0,255,255,1)] transition-all hover:scale-110 active:scale-95"
              title="Modifier ce hit"
            >
              ✏️
            </button>

            <button
              onClick={handleDelete}
              className="bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:shadow-[0_0_50px_rgba(239,68,68,1)] transition-all hover:scale-110 active:scale-95"
              title="Supprimer ce hit"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* ====================== MODAL D'ÉDITION CORRIGÉ ====================== */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 overflow-hidden"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-950 to-black w-full max-w-4xl max-h-[90vh] rounded-3xl border-4 border-neon-blue/70 shadow-[0_0_100px_rgba(0,255,255,0.6)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="px-8 py-6 border-b border-neon-blue/30 flex items-center justify-between bg-black/60 flex-shrink-0">
              <h2 className="text-5xl font-black neon-text tracking-[-0.04em]">
                MODIFIER <span className="text-neon-pink">{hit.title}</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-5xl text-gray-400 hover:text-neon-pink transition-all hover:rotate-90"
              >
                ×
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-auto p-8">
              {editError && (
                <div className="mb-6 bg-red-950/70 border border-red-500 text-red-300 p-4 rounded-2xl text-center font-medium">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-10">
                {/* ... tout ton formulaire existant reste ici ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-neon-pink font-bold mb-3 text-xl">Titre du hit</label>
                    <input
                      required
                      value={editForm.title}
                      onChange={e => updateEditForm('title', e.target.value)}
                      className="w-full bg-black border-2 border-neon-pink/60 focus:border-neon-pink rounded-2xl px-6 py-5 text-2xl focus:ring-4 focus:ring-neon-pink/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-neon-blue font-bold mb-3 text-xl">Artiste</label>
                    <input
                      required
                      value={editForm.artist}
                      onChange={e => updateEditForm('artist', e.target.value)}
                      className="w-full bg-black border-2 border-neon-blue/60 focus:border-neon-blue rounded-2xl px-6 py-5 text-2xl focus:ring-4 focus:ring-neon-blue/30 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-neon-green font-bold mb-3 text-xl">Année</label>
                    <input
                      type="number"
                      required
                      min={1980}
                      max={1989}
                      value={editForm.year}
                      onChange={e => updateEditForm('year', e.target.value)}
                      className="w-full bg-black border-2 border-neon-green/60 focus:border-neon-green rounded-2xl px-6 py-5 text-2xl focus:ring-4 focus:ring-neon-green/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-3 text-xl">Pays d’origine</label>
                    <input
                      value={editForm.country}
                      onChange={e => updateEditForm('country', e.target.value)}
                      className="w-full bg-black border-2 border-gray-500 focus:border-neon-blue rounded-2xl px-6 py-5 text-2xl focus:ring-4 focus:ring-neon-blue/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neon-pink font-bold mb-3 text-xl">La vérité derrière le hit</label>
                  <textarea
                    value={editForm.hidden_truth}
                    onChange={e => updateEditForm('hidden_truth', e.target.value)}
                    rows={4}
                    className="w-full bg-black border-2 border-neon-pink/40 focus:border-neon-pink rounded-3xl px-6 py-5 text-lg focus:ring-4 focus:ring-neon-pink/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-neon-green font-bold mb-3 text-xl">Tags (séparés par virgule)</label>
                  <input
                    value={editForm.tags}
                    onChange={e => updateEditForm('tags', e.target.value)}
                    placeholder="synthpop, new wave, dance..."
                    className="w-full bg-black border-2 border-neon-green/50 focus:border-neon-green rounded-3xl px-6 py-5 text-xl focus:ring-4 focus:ring-neon-green/30 transition-all"
                  />
                  <div className="flex flex-wrap gap-3 mt-5">
                    {tagsList.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-neon-blue/20 border border-neon-blue/60 text-white px-5 py-2 rounded-3xl text-base font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = tagsList.filter((_, i) => i !== idx);
                            setTagsList(updated);
                            updateEditForm('tags', updated.join(', '));
                          }}
                          className="text-red-400 hover:text-red-300 text-2xl leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-neon-pink font-bold mb-4 text-xl">Nouvelle jaquette</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={e => setNewImageFile(e.target.files?.[0] ?? null)}
                      className="w-full file:mr-6 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:bg-neon-pink/30 file:text-white file:font-bold hover:file:bg-neon-pink/50 bg-black border border-neon-pink/40 rounded-3xl p-4 transition-all"
                    />
                    {newImagePreview && (
                      <div className="mt-6 border border-neon-pink/30 rounded-3xl overflow-hidden">
                        <img
                          src={newImagePreview}
                          alt="Preview"
                          className="w-full h-64 object-contain bg-black"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-neon-blue font-bold mb-4 text-xl">Nouvel extrait audio</label>
                    <input
                      type="file"
                      accept="audio/mp3,audio/mpeg"
                      onChange={e => setNewAudioFile(e.target.files?.[0] ?? null)}
                      className="w-full file:mr-6 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:bg-neon-blue/30 file:text-white file:font-bold hover:file:bg-neon-blue/50 bg-black border border-neon-blue/40 rounded-3xl p-4 transition-all"
                    />
                    {newAudioPreview && (
                      <div className="mt-6 bg-black/70 border border-neon-blue/30 rounded-3xl p-6">
                        <audio controls src={newAudioPreview} className="w-full accent-neon-blue" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex-1 py-7 text-2xl font-bold rounded-3xl transition-all duration-300 shadow-2xl ${
                      editLoading
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-neon-green to-neon-blue hover:shadow-[0_0_70px_rgba(0,255,128,0.8)] hover:scale-[1.03]'
                    }`}
                  >
                    {editLoading ? (
                      <span className="flex items-center justify-center gap-4">
                        <span className="animate-spin h-7 w-7 border-4 border-white border-t-transparent rounded-full" />
                        Sauvegarde en cours…
                      </span>
                    ) : 'ENREGISTRER LES MODIFICATIONS'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-7 text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-3xl transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    ANNULER
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}