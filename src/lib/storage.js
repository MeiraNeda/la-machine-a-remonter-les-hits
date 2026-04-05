import { supabase } from './supabase';

// Helpers pour générer les URLs publiques (bucket public)
export function getPublicAudioUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from('audio').getPublicUrl(path);
  return data.publicUrl;
}

export function getPublicImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

// Exemple futur : signed URL si on passe en privé un jour
// export async function getSignedAudioUrl(path, expiresIn = 3600) {
//   const { data, error } = await supabase.storage.from('audio').createSignedUrl(path, expiresIn);
//   if (error) throw error;
//   return data.signedUrl;
// }