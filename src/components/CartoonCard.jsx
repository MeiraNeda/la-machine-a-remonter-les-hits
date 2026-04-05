// src/components/CartoonCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getPublicImageUrl } from '../lib/storage';

const ADMIN_EMAIL = 'hava.flne26@gmail.com';

export default function CartoonCard({ cartoon, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: cartoon.title || '',
    original_title: cartoon.original_title || '',
    studio: cartoon.studio || '',
    year: cartoon.year || 1985,
    type: cartoon.type || 'serie',
    episodes: cartoon.episodes || '',
    synopsis: cartoon.synopsis || '',
    country: cartoon.country || '',
    tags: cartoon.tags ? cartoon.tags.join(', ') : '',
  });

  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newAudioFile, setNewAudioFile] = useState(null);

  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newAudioPreview, setNewAudioPreview] = useState(null);

  // URLs des images (pour l'affichage sur la carte)
  const imageUrls = cartoon.image_paths && cartoon.image_paths.length > 0
    ? cartoon.image_paths.map(path => getPublicImageUrl(path))
    : (cartoon.image_path ? [getPublicImageUrl(cartoon.image_path)] : []);

  // Correction importante : Construction manuelle de l'URL audio
  const audioUrl = cartoon.audio_path 
    ? `https://fliytaqewdpuxzyijeca.supabase.co/storage/v1/object/public/audio/${cartoon.audio_path}`
    : null;

  // Suppression
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Voulez-vous vraiment supprimer "${cartoon.title}" ?`)) return;

    try {
      const { error } = await supabase.from('cartoons').delete().eq('id', cartoon.id);
      if (error) throw error;

      alert('Dessin animé supprimé avec succès !');
      if (onDelete) onDelete(cartoon.id);
    } catch (err) {
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  // Modification
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      let updateData = {
        title: editForm.title.trim(),
        original_title: editForm.original_title.trim() || null,
        studio: editForm.studio.trim() || null,
        year: Number(editForm.year),
        type: editForm.type,
        episodes: editForm.episodes ? Number(editForm.episodes) : null,
        synopsis: editForm.synopsis.trim() || null,
        country: editForm.country.trim() || null,
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      };

      // Upload nouvelles images
      const newImagePaths = [];
      for (const file of newImageFiles) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `cartoons/${crypto.randomUUID()}.${ext}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('images')
          .upload(path, file, { upsert: true });

        if (uploadErr) throw uploadErr;
        newImagePaths.push(path);
      }

      if (newImagePaths.length > 0) {
        updateData.image_paths = newImagePaths;
      }

      // Upload nouvel audio
      if (newAudioFile) {
        const ext = newAudioFile.name.split('.').pop().toLowerCase();
        const path = `cartoons/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('audio')
          .upload(path, newAudioFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        updateData.audio_path = path;
      }

      const { error } = await supabase
        .from('cartoons')
        .update(updateData)
        .eq('id', cartoon.id);

      if (error) throw error;

      alert('Dessin animé modifié avec succès !');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Erreur modification:', err);
      let msg = 'Erreur lors de la modification.';
      if (err.message?.includes('violates row-level security policy')) {
        msg = 'Erreur de permission : Vérifiez les policies des buckets "images" et "audio".';
      } else if (err.message) {
        msg = err.message;
      }
      alert(msg);
    }
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  return (
    <>
      <div className="relative group">
        <Link
          to={`/cartoon/${cartoon.id}`}
          className="block bg-gray-900/70 rounded-3xl overflow-hidden border border-neon-cyan/30 group hover:border-neon-pink/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="relative h-80 overflow-hidden bg-black">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[0]}
                alt={cartoon.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-gray-800 to-black">
                📺
              </div>
            )}

            <div className="absolute top-4 right-4 bg-black/80 px-4 py-1 rounded-full text-sm font-bold text-neon-cyan">
              {cartoon.year}
            </div>

            <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold">
              {cartoon.type === 'serie' ? 'SÉRIE' : 'FILM'}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold neon-text mb-2 line-clamp-2">{cartoon.title}</h3>
            {cartoon.studio && <p className="text-neon-pink mb-1">Studio : {cartoon.studio}</p>}
            {cartoon.original_title && cartoon.original_title !== cartoon.title && (
              <p className="text-sm text-gray-400 italic">({cartoon.original_title})</p>
            )}
          </div>

          {/* Player Audio sur la carte */}
          {audioUrl && (
            <div className="px-6 pb-6 bg-black border-t border-neon-cyan/30">
              <audio 
                controls 
                src={audioUrl} 
                className="w-full accent-neon-cyan" 
                preload="none"
              />
            </div>
          )}
        </Link>

        {isAdmin && (
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIsEditModalOpen(true); 
              }}
              className="bg-gradient-to-br from-neon-cyan to-cyan-400 text-black w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] transition-all hover:scale-110"
              title="Modifier"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="bg-gradient-to-br from-red-500 to-rose-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] transition-all hover:scale-110"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Modal d'édition (inchangé sauf pour l'audio preview) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 overflow-auto">
          <div 
            className="bg-gray-950 border-2 border-neon-cyan rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-950 border-b border-neon-cyan p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold neon-text">Modifier {cartoon.title}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-4xl text-gray-400 hover:text-white">×</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
              {/* Champs du formulaire (identiques à avant) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-neon-cyan mb-2 font-medium">Titre français</label>
                  <input value={editForm.title} onChange={e => updateEditForm('title', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-neon-cyan mb-2 font-medium">Titre original</label>
                  <input value={editForm.original_title} onChange={e => updateEditForm('original_title', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-neon-cyan mb-2 font-medium">Année</label>
                  <input type="number" value={editForm.year} onChange={e => updateEditForm('year', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-neon-cyan mb-2 font-medium">Studio</label>
                  <input value={editForm.studio} onChange={e => updateEditForm('studio', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" />
                </div>
                <div>
                  <label className="block text-neon-cyan mb-2 font-medium">Type</label>
                  <select value={editForm.type} onChange={e => updateEditForm('type', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan">
                    <option value="serie">Série animée</option>
                    <option value="film">Film animé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neon-cyan mb-2 font-medium">Nombre d'épisodes</label>
                <input type="number" value={editForm.episodes} onChange={e => updateEditForm('episodes', e.target.value)} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" />
              </div>

              <div>
                <label className="block text-neon-cyan mb-2 font-medium">Synopsis</label>
                <textarea value={editForm.synopsis} onChange={e => updateEditForm('synopsis', e.target.value)} rows={5} className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl focus:border-neon-cyan" />
              </div>

              {/* Upload Plusieurs Images */}
              <div>
                <label className="block text-neon-cyan mb-3 font-medium">Nouvelles images (plusieurs possibles)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleNewImagesChange}
                  className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-neon-cyan/20 file:text-white"
                />
                {newImagePreviews.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-neon-cyan/30">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover" />
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Audio */}
              <div>
                <label className="block text-neon-cyan mb-3 font-medium">Nouvel extrait audio / Chanson</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewAudioFile(file);
                    if (file) setNewAudioPreview(URL.createObjectURL(file));
                  }}
                  className="w-full p-4 bg-black border border-neon-cyan/50 rounded-2xl file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-neon-cyan/20 file:text-white"
                />
                {newAudioPreview && (
                  <div className="mt-6 bg-black/70 border border-neon-cyan/30 rounded-3xl p-6">
                    <audio controls src={newAudioPreview} className="w-full accent-neon-cyan" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold py-5 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all">
                  Enregistrer les modifications
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-5 rounded-2xl text-lg transition-all">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}