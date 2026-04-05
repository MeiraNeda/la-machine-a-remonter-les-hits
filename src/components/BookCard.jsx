// src/components/BookCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getPublicImageUrl } from '../lib/storage';

const ADMIN_EMAIL = 'hava.flne26@gmail.com';

export default function BookCard({ book, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: book.title || '',
    author: book.author || '',
    year: book.year || 1985,
    genre: book.genre || '',
    synopsis: book.synopsis || '',
    pages: book.pages || '',
    country: book.country || '',
    tags: book.tags ? book.tags.join(', ') : '',
  });

  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(
    book.image_path ? getPublicImageUrl(book.image_path) : null
  );

  const imageUrl = book.image_path ? getPublicImageUrl(book.image_path) : null;

  // Suppression
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Voulez-vous vraiment supprimer "${book.title}" ?`)) return;

    try {
      const { error } = await supabase.from('books').delete().eq('id', book.id);
      if (error) throw error;

      alert('Roman supprimé avec succès !');
      if (onDelete) onDelete(book.id);
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
        author: editForm.author.trim(),
        year: Number(editForm.year),
        genre: editForm.genre.trim() || null,
        synopsis: editForm.synopsis.trim() || null,
        pages: editForm.pages ? Number(editForm.pages) : null,
        country: editForm.country.trim() || null,
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      };

      // Upload nouvelle image si changée
      if (newImageFile) {
        const ext = newImageFile.name.split('.').pop().toLowerCase();
        const path = `books/${crypto.randomUUID()}.${ext}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('images')
          .upload(path, newImageFile, { upsert: true });

        if (uploadErr) throw uploadErr;
        updateData.image_path = path;
      }

      const { error } = await supabase
        .from('books')
        .update(updateData)
        .eq('id', book.id);

      if (error) throw error;

      alert('Roman modifié avec succès !');
      setIsEditModalOpen(false);
      window.location.reload(); // Rafraîchissement temporaire
    } catch (err) {
      alert('Erreur lors de la modification : ' + err.message);
    }
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="relative group">
        <Link
          to={`/book/${book.id}`}
          className="block bg-gray-900/70 rounded-3xl overflow-hidden border border-neon-purple/30 group hover:border-neon-pink/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="relative h-80 overflow-hidden bg-black">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-gray-800 to-black">
                📖
              </div>
            )}

            <div className="absolute top-4 right-4 bg-black/80 px-4 py-1 rounded-full text-sm font-bold text-neon-purple">
              {book.year}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold neon-text mb-2 line-clamp-2">{book.title}</h3>
            <p className="text-neon-pink mb-3">par {book.author}</p>

            {book.genre && (
              <p className="text-sm text-gray-400 mb-4">{book.genre}</p>
            )}

            {book.synopsis && (
              <p className="text-gray-500 text-sm line-clamp-3">
                {book.synopsis}
              </p>
            )}
          </div>
        </Link>

        {/* Boutons Admin */}
        {isAdmin && (
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIsEditModalOpen(true); 
              }}
              className="bg-gradient-to-br from-neon-yellow to-amber-400 text-black w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(234,179,8,0.8)] transition-all hover:scale-110"
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

      {/* ====================== MODAL D'ÉDITION ====================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 overflow-auto">
          <div 
            className="bg-gray-950 border-2 border-neon-yellow rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-950 border-b border-neon-yellow p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold neon-text">Modifier {book.title}</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-4xl text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-neon-yellow mb-2 font-medium">Titre du roman</label>
                  <input
                    value={editForm.title}
                    onChange={e => updateEditForm('title', e.target.value)}
                    className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neon-yellow mb-2 font-medium">Auteur</label>
                  <input
                    value={editForm.author}
                    onChange={e => updateEditForm('author', e.target.value)}
                    className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-neon-yellow mb-2 font-medium">Année</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={e => updateEditForm('year', e.target.value)}
                    className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neon-yellow mb-2 font-medium">Genre</label>
                  <input
                    value={editForm.genre}
                    onChange={e => updateEditForm('genre', e.target.value)}
                    className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                  />
                </div>
                <div>
                  <label className="block text-neon-yellow mb-2 font-medium">Pages</label>
                  <input
                    type="number"
                    value={editForm.pages}
                    onChange={e => updateEditForm('pages', e.target.value)}
                    className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neon-yellow mb-2 font-medium">Synopsis</label>
                <textarea
                  value={editForm.synopsis}
                  onChange={e => updateEditForm('synopsis', e.target.value)}
                  rows={5}
                  className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl focus:border-neon-yellow"
                />
              </div>

              {/* Upload nouvelle image */}
              <div>
                <label className="block text-neon-yellow mb-3 font-medium">Nouvelle couverture</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewImageFile(file);
                    if (file) {
                      setNewImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full p-4 bg-black border border-neon-yellow/50 rounded-2xl file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-neon-yellow/20 file:text-white"
                />

                {newImagePreview && (
                  <div className="mt-6 border border-neon-yellow/30 rounded-2xl overflow-hidden">
                    <img 
                      src={newImagePreview} 
                      alt="Prévisualisation" 
                      className="w-full max-h-80 object-contain bg-black p-4" 
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-neon-yellow to-amber-500 text-black font-bold py-5 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-all"
                >
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-5 rounded-2xl text-lg transition-all"
                >
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