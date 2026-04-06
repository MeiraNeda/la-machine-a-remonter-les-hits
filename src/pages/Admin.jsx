// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CartoonsPage from './CartoonsPage';

const ADMIN_EMAIL = 'hava.flne26@gmail.com';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('hit'); // 'hit' | 'movie' | 'book'

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // ==================== FORMULAIRE HIT ====================
  const [hitForm, setHitForm] = useState({
    title: '',
    artist: '',
    year: 1985,
    country: '',
    hidden_truth: '',
    tags: '',
    story_chapters: [{ order: 1, title: 'L’idée', text: '', duration_sec: 15 }],
    timeline_events: [{ year: 1984, month: null, description: 'Écriture de la chanson', icon: 'star' }],
  });

  const [audioFile, setAudioFile] = useState(null);
  const [hitImageFile, setHitImageFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [hitImagePreviewUrl, setHitImagePreviewUrl] = useState(null);

  // ==================== FORMULAIRE FILM/SÉRIE ====================
  const [movieForm, setMovieForm] = useState({
    title: '',
    director: '',
    year: 1985,
    type: 'film',
    actors: '', 
    synopsis: '',
    duration_min: '',
    country: '',
    tags: '',
  });

  const [movieImageFile, setMovieImageFile] = useState(null);
  const [movieImagePreviewUrl, setMovieImagePreviewUrl] = useState(null);

  // ==================== FORMULAIRE ROMAN ====================
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    year: 1985,
    genre: '',
    synopsis: '',
    pages: '',
    country: '',
    tags: '',
  });

  const [bookImageFile, setBookImageFile] = useState(null);
  const [bookImagePreviewUrl, setBookImagePreviewUrl] = useState(null);

  // ==================== FORMULAIRE DESSIN ANIMÉ ====================
  const [cartoonForm, setCartoonForm] = useState({
    title: '',
    original_title: '',
    studio: '',
    year: 1985,
    type: 'serie',
    episodes: '',
    synopsis: '',
    country: '',
    tags: '',
  });

  const [cartoonImages, setCartoonImages] = useState([]);           // ← Tableau pour plusieurs images
  const [cartoonImagePreviews, setCartoonImagePreviews] = useState([]); // Prévisualisations
  const [cartoonAudioFile, setCartoonAudioFile] = useState(null);
  const [cartoonAudioPreviewUrl, setCartoonAudioPreviewUrl] = useState(null);

  useEffect(() => {
    if (cartoonAudioFile) {
      const url = URL.createObjectURL(cartoonAudioFile);
      setCartoonAudioPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [cartoonAudioFile]);

  // Vérification admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAccessDenied(true);
      setError('Vous devez être connecté pour accéder à cette page.');
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      setAccessDenied(true);
      setError('Accès réservé à l’administrateur.');
    }
  }, [user, authLoading]);

    // === REAL-TIME : Mise à jour instantanée après ajout d'un hit ===
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const channel = supabase
      .channel('admin-hits-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'hits' 
        },
        (payload) => {
          console.log('🔄 Changement détecté dans hits (Admin):', payload.eventType);
          
          // Optionnel : petite notification visuelle
          setMessage(`✅ Hit ${payload.eventType === 'INSERT' ? 'ajouté' : payload.eventType === 'UPDATE' ? 'modifié' : 'supprimé'} avec succès !`);
          
          // Efface le message après 3 secondes
          setTimeout(() => setMessage(''), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Prévisualisations
  useEffect(() => {
    if (hitImageFile) {
      const url = URL.createObjectURL(hitImageFile);
      setHitImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [hitImageFile]);

  useEffect(() => {
    if (movieImageFile) {
      const url = URL.createObjectURL(movieImageFile);
      setMovieImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [movieImageFile]);

  useEffect(() => {
    if (bookImageFile) {
      const url = URL.createObjectURL(bookImageFile);
      setBookImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bookImageFile]);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  // Update functions
  const updateHitForm = (field, value) => setHitForm(prev => ({ ...prev, [field]: value }));
  const updateMovieForm = (field, value) => setMovieForm(prev => ({ ...prev, [field]: value }));
  const updateBookForm = (field, value) => setBookForm(prev => ({ ...prev, [field]: value }));
  const updateCartoonForm = (field, value) => setCartoonForm(prev => ({ ...prev, [field]: value }));

  // === Fonctions Chapitres & Timeline (Hits) ===
  const addChapter = () => {
    setHitForm(prev => ({
      ...prev,
      story_chapters: [...prev.story_chapters, { order: prev.story_chapters.length + 1, title: '', text: '', duration_sec: 15 }],
    }));
  };

  const removeChapter = (index) => {
    setHitForm(prev => ({
      ...prev,
      story_chapters: prev.story_chapters
        .filter((_, i) => i !== index)
        .map((ch, i) => ({ ...ch, order: i + 1 })),
    }));
  };

  const updateChapter = (index, field, value) => {
    setHitForm(prev => ({
      ...prev,
      story_chapters: prev.story_chapters.map((ch, i) =>
        i === index ? { ...ch, [field]: value } : ch
      ),
    }));
  };

  const addTimelineEvent = () => {
    setHitForm(prev => ({
      ...prev,
      timeline_events: [...prev.timeline_events, { year: 1984, month: null, description: '', icon: 'star' }],
    }));
  };

  const removeTimelineEvent = (index) => {
    setHitForm(prev => ({
      ...prev,
      timeline_events: prev.timeline_events.filter((_, i) => i !== index),
    }));
  };

  const updateTimelineEvent = (index, field, value) => {
    setHitForm(prev => ({
      ...prev,
      timeline_events: prev.timeline_events.map((ev, i) =>
        i === index ? { ...ev, [field]: value } : ev
      ),
    }));
  };

  // === Soumission Hit ===
  const handleSubmitHit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUploading(true);

    // Validation de base
    if (!hitForm.title?.trim() || !hitForm.artist?.trim() || !audioFile) {
      setError('Titre, artiste et fichier audio sont obligatoires.');
      setUploading(false);
      return;
    }

    try {
      const cleanTitle = hitForm.title.trim();
      const cleanArtist = hitForm.artist.trim();

      // Vérification si le hit existe déjà (même titre + même artiste)
      const { data: existing, error: checkErr } = await supabase
        .from('hits')
        .select('id, title, artist')
        .eq('title', cleanTitle)
        .eq('artist', cleanArtist)
        .maybeSingle();

      if (checkErr) {
        console.error('Erreur lors de la vérification du doublon:', checkErr);
        throw checkErr;
      }

      if (existing) {
        setError(`🎵 "${cleanTitle}" par ${cleanArtist} existe déjà dans la base !`);
        setUploading(false);
        return;
      }

      // ====================== Upload Audio ======================
      const audioExt = audioFile.name.split('.').pop().toLowerCase();
      const audioPath = `hits/${crypto.randomUUID()}.${audioExt}`;

      const { error: audioErr } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile, { upsert: false });

      if (audioErr) throw audioErr;

      // ====================== Upload Image (optionnel) ======================
      let imagePath = null;
      if (hitImageFile) {
        const imageExt = hitImageFile.name.split('.').pop().toLowerCase();
        imagePath = `hits/${crypto.randomUUID()}.${imageExt}`;

        const { error: imgErr } = await supabase.storage
          .from('images')
          .upload(imagePath, hitImageFile, { upsert: false });

        if (imgErr) throw imgErr;
      }

      // ====================== Préparation des données ======================
      const tagsArray = hitForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      // ====================== Insertion dans la base ======================
      const { error: dbErr } = await supabase.from('hits').insert({
        title: cleanTitle,
        artist: cleanArtist,
        year: Number(hitForm.year),
        country: hitForm.country.trim() || null,
        audio_path: audioPath,
        image_path: imagePath,
        hidden_truth: hitForm.hidden_truth.trim() || null,
        tags: tagsArray.length ? tagsArray : null,
        story_chapters: hitForm.story_chapters,
        timeline_events: hitForm.timeline_events,
      });

      if (dbErr) throw dbErr;

      // Succès
      setMessage('✅ Hit ajouté avec succès !');

      // Réinitialisation du formulaire
      resetHitForm();

    } catch (err) {
      console.error('Erreur lors de l’ajout du hit:', err);
      
      // Message d'erreur plus convivial
      let errorMsg = 'Une erreur est survenue lors de l’ajout du hit.';
      
      if (err.message?.includes('duplicate key')) {
        errorMsg = 'Ce hit existe déjà (titre + artiste identiques).';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

// === Soumission Film/Série ===
const handleSubmitMovie = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');
  setUploading(true);

  // Validation de base
  if (!movieForm.title?.trim() || !movieForm.director?.trim()) {
    setError('Titre et réalisateur sont obligatoires.');
    setUploading(false);
    return;
  }

  try {
    const cleanTitle = movieForm.title.trim();
    const cleanDirector = movieForm.director.trim();

    // Vérification doublon (titre + réalisateur)
    const { data: existing, error: checkErr } = await supabase
      .from('movies_series')
      .select('id')
      .eq('title', cleanTitle)
      .eq('director', cleanDirector)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
      setError(`🎬 "${cleanTitle}" réalisé par ${cleanDirector} existe déjà !`);
      setUploading(false);
      return;
    }

    // Upload de l'image (optionnel)
    let imagePath = null;
    if (movieImageFile) {
      const imageExt = movieImageFile.name.split('.').pop().toLowerCase();
      imagePath = `movies/${crypto.randomUUID()}.${imageExt}`;

      const { error: imgErr } = await supabase.storage
        .from('images')
        .upload(imagePath, movieImageFile, { upsert: false });

      if (imgErr) throw imgErr;
    }

    // Préparation des tags
    const tagsArray = movieForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Insertion dans la base (version sécurisée avec optional chaining)
    const { error: dbErr } = await supabase.from('movies_series').insert({
      title: cleanTitle,
      director: cleanDirector,
      year: Number(movieForm.year),
      type: movieForm.type || 'film',
      actors: movieForm.actors?.trim() || null,        // ← Utilise .actors (pas cast)
      synopsis: movieForm.synopsis?.trim() || null,
      duration_min: movieForm.duration_min 
        ? Number(movieForm.duration_min) 
        : null,
      country: movieForm.country?.trim() || null,
      tags: tagsArray.length ? tagsArray : null,
      image_path: imagePath,
    });

    if (dbErr) throw dbErr;

    // Succès
    setMessage('✅ Film/Série ajouté avec succès !');
    resetMovieForm();

  } catch (err) {
    console.error('Erreur lors de l’ajout du film/série:', err);
    
    let errorMsg = 'Une erreur est survenue lors de l’ajout du film/série.';
    
    if (err.message?.includes('duplicate key') || err.code === '23505') {
      errorMsg = 'Ce film ou série existe déjà dans la base.';
    } else if (err.message) {
      errorMsg = err.message;
    }

    setError(errorMsg);
  } finally {
    setUploading(false);
  }
};

  // === Soumission Roman (NOUVEAU) ===
  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUploading(true);

    if (!bookForm.title || !bookForm.author) {
      setError('Titre et auteur sont obligatoires');
      setUploading(false);
      return;
    }

    try {
      let imagePath = null;
      if (bookImageFile) {
        const imageExt = bookImageFile.name.split('.').pop().toLowerCase();
        imagePath = `books/${crypto.randomUUID()}.${imageExt}`;

        const { error: imgErr } = await supabase.storage
          .from('images')
          .upload(imagePath, bookImageFile, { upsert: false });

        if (imgErr) throw imgErr;
      }

      const tagsArray = bookForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { error: dbErr } = await supabase.from('books').insert({
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        year: Number(bookForm.year),
        genre: bookForm.genre.trim() || null,
        synopsis: bookForm.synopsis.trim() || null,
        pages: bookForm.pages ? Number(bookForm.pages) : null,
        country: bookForm.country.trim() || null,
        tags: tagsArray.length ? tagsArray : null,
        image_path: imagePath,
      });

      if (dbErr) throw dbErr;

      setMessage('✅ Roman ajouté avec succès !');
      resetBookForm();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de l’ajout du roman');
    } finally {
      setUploading(false);
    }
  };

  // === Soumission Dessin Animé ===
const handleSubmitCartoon = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUploading(true);

    if (!cartoonForm.title?.trim()) {
      setError('Le titre est obligatoire');
      setUploading(false);
      return;
    }

    try {
      // Upload des images multiples
      const imagePaths = [];
      for (const file of cartoonImages) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `cartoons/${crypto.randomUUID()}.${ext}`;
        
        const { error: imgErr } = await supabase.storage
          .from('images')
          .upload(path, file, { upsert: false });

        if (imgErr) throw imgErr;
        imagePaths.push(path);
      }

      // Upload audio (optionnel)
      let audioPath = null;
      if (cartoonAudioFile) {
        const audioExt = cartoonAudioFile.name.split('.').pop().toLowerCase();
        audioPath = `cartoons/${crypto.randomUUID()}.${audioExt}`;
        const { error: audioErr } = await supabase.storage
          .from('audio')
          .upload(audioPath, cartoonAudioFile, { upsert: false });
        if (audioErr) throw audioErr;
      }

      const tagsArray = cartoonForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const { error: dbErr } = await supabase.from('cartoons').insert({
        title: cartoonForm.title.trim(),
        original_title: cartoonForm.original_title.trim() || null,
        studio: cartoonForm.studio.trim() || null,
        year: Number(cartoonForm.year),
        type: cartoonForm.type,
        episodes: cartoonForm.episodes ? Number(cartoonForm.episodes) : null,
        synopsis: cartoonForm.synopsis.trim() || null,
        country: cartoonForm.country.trim() || null,
        tags: tagsArray.length ? tagsArray : null,
        image_paths: imagePaths.length > 0 ? imagePaths : null,   // ← Tableau d'images
        audio_path: audioPath,
      });

      if (dbErr) throw dbErr;

      setMessage('✅ Dessin animé ajouté avec succès !');
      resetCartoonForm();

    } catch (err) {
      console.error('Erreur lors de l’ajout du dessin animé:', err);
      setError(err.message || 'Erreur lors de l’ajout du dessin animé');
    } finally {
      setUploading(false);
    }
  };

  const resetHitForm = () => {
    setHitForm({
      title: '',
      artist: '',
      year: 1985,
      country: '',
      hidden_truth: '',
      tags: '',
      story_chapters: [{ 
        order: 1, 
        title: 'L’idée', 
        text: '', 
        duration_sec: 15 
      }],
      timeline_events: [{ 
        year: 1984, 
        month: null, 
        description: 'Écriture de la chanson', 
        icon: 'star' 
      }],
    });
    setAudioFile(null);
    setHitImageFile(null);
    setAudioPreviewUrl(null);
    setHitImagePreviewUrl(null);
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      director: '',
      year: 1985,
      type: 'film',
      actors: '', 
      synopsis: '',
      duration_min: '',
      country: '',
      tags: '',
    });
    setMovieImageFile(null);
    setMovieImagePreviewUrl(null);
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      year: 1985,
      genre: '',
      synopsis: '',
      pages: '',
      country: '',
      tags: '',
    });
    setBookImageFile(null);
    setBookImagePreviewUrl(null);
  };

  const resetCartoonForm = () => {
    setCartoonForm({
      title: '',
      original_title: '',
      studio: '',
      year: 1985,
      type: 'serie',
      episodes: '',
      synopsis: '',
      country: '',
      tags: '',
    });
    setCartoonImages([]);
    setCartoonImagePreviews([]);
    setCartoonAudioFile(null);
    setCartoonAudioPreviewUrl(null);
  };

  // Gestion des fichiers images multiples
  const handleCartoonImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCartoonImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setCartoonImagePreviews(previews);

    // Nettoyage des URLs précédentes
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  };

  if (authLoading) return <div className="text-center py-40 text-2xl">Vérification des droits...</div>;

  if (accessDenied) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-6">Accès refusé</h1>
        <p className="text-xl text-gray-300 mb-8">{error}</p>
        <Link to="/" className="inline-block bg-neon-blue text-black font-bold py-4 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]">
          ← Retour à l’accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      <h1 className="text-5xl font-bold neon-text mb-10 text-center">ADMIN PANEL 80s</h1>

      {/* Onglets */}
      <div className="flex justify-center mb-12 border-b border-gray-700 flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('hit')}
          className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${activeTab === 'hit' ? 'border-b-4 border-neon-pink text-neon-pink' : 'text-gray-400 hover:text-white'}`}
        >
          🎵 Hit 80s
        </button>
        <button
          onClick={() => setActiveTab('movie')}
          className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${activeTab === 'movie' ? 'border-b-4 border-neon-purple text-neon-purple' : 'text-gray-400 hover:text-white'}`}
        >
          🎬 Film / Série
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${activeTab === 'book' ? 'border-b-4 border-neon-yellow text-neon-yellow' : 'text-gray-400 hover:text-white'}`}
        >
          📖 Roman 80s
        </button>
        <button
          onClick={() => setActiveTab('cartoon')}
          className={`px-8 py-4 text-lg font-bold transition-all duration-300 ${activeTab === 'cartoon' ? 'border-b-4 border-neon-cyan text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
        >
          📺 Dessin Animé 80s
        </button>
      </div>

      {/* ====================== FORMULAIRE HIT ====================== */}
      {activeTab === 'hit' && (
        <form onSubmit={handleSubmitHit} className="space-y-10 bg-gray-950/70 p-10 rounded-2xl border border-neon-blue/30">
          {/* Infos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-neon-pink">Titre du hit *</label>
              <input
                required
                value={hitForm.title}
                onChange={e => updateHitForm('title', e.target.value)}
                className="w-full p-4 bg-black border border-neon-pink/50 rounded-lg focus:border-neon-pink"
              />
            </div>
            <div>
              <label className="block mb-2 text-neon-blue">Artiste *</label>
              <input
                required
                value={hitForm.artist}
                onChange={e => updateHitForm('artist', e.target.value)}
                className="w-full p-4 bg-black border border-neon-blue/50 rounded-lg focus:border-neon-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-neon-green">Année (1980-1989) *</label>
              <input
                type="number"
                required
                min={1980}
                max={1989}
                value={hitForm.year}
                onChange={e => updateHitForm('year', e.target.value)}
                className="w-full p-4 bg-black border border-neon-green/50 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Pays d’origine</label>
              <input
                value={hitForm.country}
                onChange={e => updateHitForm('country', e.target.value)}
                placeholder="ex: Norway, USA, UK"
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Tags (séparés par virgule)</label>
              <input
                value={hitForm.tags}
                onChange={e => updateHitForm('tags', e.target.value)}
                placeholder="synthpop, new wave, dance"
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {/* Vérité cachée */}
          <div>
            <label className="block mb-2 text-xl text-neon-pink font-bold">La vérité derrière le hit</label>
            <textarea
              value={hitForm.hidden_truth}
              onChange={e => updateHitForm('hidden_truth', e.target.value)}
              rows={4}
              placeholder="Ex: Beaucoup pensent que c'est une déclaration d'amour... mais c'est une chanson sur la jalousie..."
              className="w-full p-4 bg-black border border-neon-pink/40 rounded-lg focus:border-neon-pink"
            />
          </div>

          {/* Chapitres de Story */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neon-blue">Chapitres de la Story (15s chacun)</h2>
              <button
                type="button"
                onClick={addChapter}
                className="bg-neon-blue/30 hover:bg-neon-blue/50 px-5 py-2 rounded-lg"
              >
                + Ajouter chapitre
              </button>
            </div>

            {hitForm.story_chapters?.map((chapter, idx) => (
              <div key={idx} className="mb-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">Chapitre {chapter.order}</h3>
                  {hitForm.story_chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChapter(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <input
                  placeholder="Titre du chapitre"
                  value={chapter.title}
                  onChange={e => updateChapter(idx, 'title', e.target.value)}
                  className="w-full mb-3 p-3 bg-black border border-gray-600 rounded"
                />

                <textarea
                  placeholder="Texte du chapitre (~60-80 mots)"
                  value={chapter.text}
                  onChange={e => updateChapter(idx, 'text', e.target.value)}
                  rows={3}
                  className="w-full mb-3 p-3 bg-black border border-gray-600 rounded"
                />

                <input
                  type="number"
                  placeholder="Durée en secondes"
                  value={chapter.duration_sec}
                  onChange={e => updateChapter(idx, 'duration_sec', Number(e.target.value))}
                  min={5}
                  max={30}
                  className="w-32 p-3 bg-black border border-gray-600 rounded"
                />
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neon-green">Naissance du tube – Timeline</h2>
              <button
                type="button"
                onClick={addTimelineEvent}
                className="bg-neon-green/30 hover:bg-neon-green/50 px-5 py-2 rounded-lg"
              >
                + Ajouter événement
              </button>
            </div>

            {hitForm.timeline_events?.map((event, idx) => (
              <div key={idx} className="mb-5 p-5 bg-gray-900/40 rounded-xl border border-gray-700 flex gap-4 flex-wrap">
                <input
                  type="number"
                  placeholder="Année"
                  value={event.year}
                  onChange={e => updateTimelineEvent(idx, 'year', Number(e.target.value))}
                  className="w-24 p-3 bg-black border border-gray-600 rounded"
                />
                <input
                  type="number"
                  placeholder="Mois (1-12)"
                  value={event.month ?? ''}
                  onChange={e => updateTimelineEvent(idx, 'month', e.target.value ? Number(e.target.value) : null)}
                  min={1}
                  max={12}
                  className="w-24 p-3 bg-black border border-gray-600 rounded"
                />
                <input
                  placeholder="Description"
                  value={event.description}
                  onChange={e => updateTimelineEvent(idx, 'description', e.target.value)}
                  className="flex-1 p-3 bg-black border border-gray-600 rounded"
                />
                <input
                  placeholder="Icon (star, music...)"
                  value={event.icon}
                  onChange={e => updateTimelineEvent(idx, 'icon', e.target.value)}
                  className="w-32 p-3 bg-black border border-gray-600 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeTimelineEvent(idx)}
                  className="text-red-400 hover:text-red-300 self-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Uploads Audio + Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-700 pt-10">
            <div>
              <label className="block mb-3 text-xl font-bold text-neon-pink">Extrait audio MP3 *</label>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
                required
                className="w-full p-3 bg-black border border-neon-pink/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-pink/20 file:text-white hover:file:bg-neon-pink/40"
              />
              {audioPreviewUrl && (
                <div className="mt-4">
                  <audio controls src={audioPreviewUrl} className="w-full" />
                  <p className="text-sm text-gray-400 mt-1">Prévisualisation locale</p>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-3 text-xl font-bold text-neon-blue">Jaquette / Visuel PNG/JPG</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={e => setHitImageFile(e.target.files?.[0] ?? null)}
                className="w-full p-3 bg-black border border-neon-blue/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-blue/20 file:text-white hover:file:bg-neon-blue/40"
              />
              {hitImagePreviewUrl && (
                <div className="mt-4">
                  <img
                    src={hitImagePreviewUrl}
                    alt="Prévisualisation"
                    className="max-h-64 object-contain mx-auto rounded-lg border border-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-700">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-neon-pink to-neon-blue text-black font-bold py-6 px-10 rounded-xl text-xl disabled:opacity-50 shadow-lg hover:shadow-neon-pink/50 transition-all"
            >
              {uploading ? 'Ajout en cours…' : 'Ajouter ce tube mythique →'}
            </button>

            <button
              type="button"
              onClick={resetHitForm}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 px-10 rounded-xl text-xl"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      )}

      {/* ====================== FORMULAIRE FILM/SÉRIE ====================== */}
      {activeTab === 'movie' && (
        <form onSubmit={handleSubmitMovie} className="space-y-10 bg-gray-950/70 p-10 rounded-2xl border border-neon-purple/30">
          {/* Le formulaire Film/Série que je t’ai déjà fourni précédemment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-neon-pink">Titre *</label>
              <input
                required
                value={movieForm.title}
                onChange={e => updateMovieForm('title', e.target.value)}
                className="w-full p-4 bg-black border border-neon-pink/50 rounded-lg focus:border-neon-pink"
              />
            </div>
            <div>
              <label className="block mb-2 text-neon-blue">Réalisateur *</label>
              <input
                required
                value={movieForm.director}
                onChange={e => updateMovieForm('director', e.target.value)}
                className="w-full p-4 bg-black border border-neon-blue/50 rounded-lg focus:border-neon-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-neon-green">Année (1980-1989) *</label>
              <input
                type="number"
                required
                min={1980}
                max={1989}
                value={movieForm.year}
                onChange={e => updateMovieForm('year', e.target.value)}
                className="w-full p-4 bg-black border border-neon-green/50 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Type *</label>
              <select
                value={movieForm.type}
                onChange={e => updateMovieForm('type', e.target.value)}
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              >
                <option value="film">Film</option>
                <option value="serie">Série</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Pays</label>
              <input
                value={movieForm.country}
                onChange={e => updateMovieForm('country', e.target.value)}
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Acteurs principaux</label>
            <input
              value={movieForm.actors || ''}
              onChange={e => updateMovieForm('actors', e.target.value)}
              placeholder="Michael J. Fox, Christopher Lloyd..."
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2">Synopsis</label>
            <textarea
              value={movieForm.synopsis}
              onChange={e => updateMovieForm('synopsis', e.target.value)}
              rows={5}
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Durée (en minutes)</label>
              <input
                type="number"
                value={movieForm.duration_min}
                onChange={e => updateMovieForm('duration_min', e.target.value)}
                placeholder="116"
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Tags (séparés par virgule)</label>
              <input
                value={movieForm.tags}
                onChange={e => updateMovieForm('tags', e.target.value)}
                placeholder="cult, sci-fi, adventure"
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {/* Upload Image Film/Série */}
          <div>
            <label className="block mb-3 text-xl font-bold text-black">Affiche / Jaquette PNG ou JPG</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => setMovieImageFile(e.target.files?.[0] ?? null)}
              className="w-full p-3 bg-black border border-neon-purple/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-purple/20 file:text-white hover:file:bg-neon-purple/40"
            />
            {movieImagePreviewUrl && (
              <div className="mt-6">
                <img
                  src={movieImagePreviewUrl}
                  alt="Prévisualisation"
                  className="max-h-80 object-contain mx-auto rounded-lg border border-gray-700"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-700">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-6 px-10 rounded-xl text-xl disabled:opacity-50 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all"
            >
              {uploading ? 'Ajout en cours…' : 'Ajouter ce Film / Série →'}
            </button>

            <button
              type="button"
              onClick={resetMovieForm}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 px-10 rounded-xl text-xl"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      )}
      {/* ====================== FORMULAIRE ROMAN (NOUVEAU) ====================== */}
      {activeTab === 'book' && (
        <form onSubmit={handleSubmitBook} className="space-y-10 bg-gray-950/70 p-10 rounded-2xl border border-neon-yellow/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-neon-yellow">Titre du roman *</label>
              <input
                required
                value={bookForm.title}
                onChange={e => updateBookForm('title', e.target.value)}
                className="w-full p-4 bg-black border border-neon-yellow/50 rounded-lg focus:border-neon-yellow"
              />
            </div>
            <div>
              <label className="block mb-2 text-neon-pink">Auteur *</label>
              <input
                required
                value={bookForm.author}
                onChange={e => updateBookForm('author', e.target.value)}
                className="w-full p-4 bg-black border border-neon-pink/50 rounded-lg focus:border-neon-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-neon-green">Année (1980-1989) *</label>
              <input
                type="number"
                required
                min={1980}
                max={1989}
                value={bookForm.year}
                onChange={e => updateBookForm('year', e.target.value)}
                className="w-full p-4 bg-black border border-neon-green/50 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Genre</label>
              <input
                value={bookForm.genre}
                onChange={e => updateBookForm('genre', e.target.value)}
                placeholder="Science-fiction, Thriller, Littérature..."
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Nombre de pages</label>
              <input
                type="number"
                value={bookForm.pages}
                onChange={e => updateBookForm('pages', e.target.value)}
                placeholder="320"
                className="w-full p-4 bg-black border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Pays d'origine</label>
            <input
              value={bookForm.country}
              onChange={e => updateBookForm('country', e.target.value)}
              placeholder="France, USA, UK..."
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2">Synopsis</label>
            <textarea
              value={bookForm.synopsis}
              onChange={e => updateBookForm('synopsis', e.target.value)}
              rows={5}
              placeholder="Résumé du roman..."
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2">Tags (séparés par virgule)</label>
            <input
              value={bookForm.tags}
              onChange={e => updateBookForm('tags', e.target.value)}
              placeholder="dystopie, cyberpunk, best-seller"
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>

          {/* Upload Image Roman */}
          <div>
            <label className="block mb-3 text-xl font-bold text-black">Couverture du livre PNG ou JPG</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => setBookImageFile(e.target.files?.[0] ?? null)}
              className="w-full p-3 bg-black border border-neon-yellow/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-yellow/20 file:text-white hover:file:bg-neon-yellow/40"
            />
            {bookImagePreviewUrl && (
              <div className="mt-6">
                <img
                  src={bookImagePreviewUrl}
                  alt="Prévisualisation"
                  className="max-h-80 object-contain mx-auto rounded-lg border border-gray-700"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-700">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-neon-yellow to-amber-500 text-white font-bold py-6 px-10 rounded-xl text-xl disabled:opacity-50 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-all"
            >
              {uploading ? 'Ajout en cours…' : 'Ajouter ce Roman →'}
            </button>

            <button
              type="button"
              onClick={resetBookForm}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 px-10 rounded-xl text-xl"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      )}

      {/* ====================== FORMULAIRE DESSIN ANIMÉ ====================== */}
    {activeTab === 'cartoon' && (
      <form onSubmit={handleSubmitCartoon} className="space-y-10 bg-gray-950/70 p-10 rounded-2xl border border-neon-cyan/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-neon-cyan">Titre français *</label>
            <input
              required
              value={cartoonForm.title}
              onChange={e => updateCartoonForm('title', e.target.value)}
              className="w-full p-4 bg-black border border-neon-cyan/50 rounded-lg focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="block mb-2">Titre original</label>
            <input
              value={cartoonForm.original_title}
              onChange={e => updateCartoonForm('original_title', e.target.value)}
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-neon-green">Année (1980-1989) *</label>
            <input
              type="number"
              required
              min={1980}
              max={1989}
              value={cartoonForm.year}
              onChange={e => updateCartoonForm('year', e.target.value)}
              className="w-full p-4 bg-black border border-neon-green/50 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-2">Studio</label>
            <input
              value={cartoonForm.studio}
              onChange={e => updateCartoonForm('studio', e.target.value)}
              placeholder="Filmation, Sunbow, Toei..."
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-2">Type *</label>
            <select
              value={cartoonForm.type}
              onChange={e => updateCartoonForm('type', e.target.value)}
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            >
              <option value="serie">Série animée</option>
              <option value="film">Film animé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2">Synopsis</label>
          <textarea
            value={cartoonForm.synopsis}
            onChange={e => updateCartoonForm('synopsis', e.target.value)}
            rows={5}
            className="w-full p-4 bg-black border border-gray-600 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Nombre d'épisodes</label>
            <input
              type="number"
              value={cartoonForm.episodes}
              onChange={e => updateCartoonForm('episodes', e.target.value)}
              placeholder="65"
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-2">Pays</label>
            <input
              value={cartoonForm.country}
              onChange={e => updateCartoonForm('country', e.target.value)}
              className="w-full p-4 bg-black border border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Tags (séparés par virgule)</label>
          <input
            value={cartoonForm.tags}
            onChange={e => updateCartoonForm('tags', e.target.value)}
            placeholder="robot, fantasy, action, toy-line"
            className="w-full p-4 bg-black border border-gray-600 rounded-lg"
          />
        </div>

        {/* Upload Audio */}
      <div>
        <label className="block mb-3 text-xl font-bold text-neon-cyan">Extrait audio / Chanson MP3</label>
        <input
          type="file"
          accept="audio/mp3,audio/mpeg"
          onChange={e => setCartoonAudioFile(e.target.files?.[0] ?? null)}
          className="w-full p-3 bg-black border border-neon-cyan/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-cyan/20 file:text-white hover:file:bg-neon-cyan/40"
        />
        {cartoonAudioPreviewUrl && (
          <div className="mt-4">
            <audio controls src={cartoonAudioPreviewUrl} className="w-full" />
            <p className="text-sm text-gray-400 mt-1">Prévisualisation locale</p>
          </div>
        )}
      </div>

        {/* Upload Multiple Images */}
          <div>
            <label className="block mb-3 text-xl font-bold text-neon-cyan">Images / Jaquettes (vous pouvez en sélectionner plusieurs)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={handleCartoonImagesChange}
              className="w-full p-3 bg-black border border-neon-cyan/50 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-cyan/20 file:text-white hover:file:bg-neon-cyan/40"
            />
            
            {cartoonImagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {cartoonImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-neon-cyan/30"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-700">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold py-6 px-10 rounded-xl text-xl disabled:opacity-50 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all"
          >
            {uploading ? 'Ajout en cours…' : 'Ajouter ce Dessin Animé →'}
          </button>

          <button
            type="button"
            onClick={resetCartoonForm}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 px-10 rounded-xl text-xl"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    )}

      {message && <p className="text-center text-3xl text-green-400 mt-10 font-bold">{message}</p>}
      {error && <p className="text-center text-3xl text-red-500 mt-10 font-bold">{error}</p>}
    </div>
  );
}