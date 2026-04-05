// src/lib/helpers.js

export function getPublicUrl(bucket, path) {
  if (!path || !bucket) return null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');

  if (!supabaseUrl) {
    console.error("❌ VITE_SUPABASE_URL manquante dans .env");
    return null;
  }

  const cleanPath = path.replace(/^\//, '');

  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(cleanPath)}`;

  console.log(`🔗 getPublicUrl → bucket: ${bucket} | path: ${cleanPath}`);
  console.log(`📎 URL finale : ${url}`);

  return url;
}

export const initialChapter = {
  order: 1,
  title: '',
  text: '',
  duration_sec: 15,
};

export const initialTimelineEvent = {
  year: 1984,
  month: null,
  description: '',
  icon: 'star',
};