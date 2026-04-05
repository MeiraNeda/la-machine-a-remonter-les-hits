// src/lib/tts.js

/**
 * Web Speech API - Voix française native du navigateur
 * Solution 100% gratuite, stable et sans dépendance externe
 */

let currentUtterance = null;

/**
 * Joue une narration en français avec la voix native du navigateur
 * 
 * @param {string} text - Texte à lire
 * @param {Object} options
 * @param {string} options.voiceName - Nom de la voix (ex: "Google français", "Microsoft Hortense")
 * @param {number} options.rate - Vitesse (0.8 à 1.8, défaut 1.05)
 * @param {number} options.pitch - Tonalité (0 à 2, défaut 1)
 */
export async function playNarration(text, options = {}) {
  stopNarration();

  if (!text?.trim()) {
    console.warn("⚠️ Texte vide pour la narration");
    return;
  }

  if (!('speechSynthesis' in window)) {
    console.error("❌ SpeechSynthesis non supporté par ce navigateur.");
    alert("Votre navigateur ne supporte pas la synthèse vocale.");
    return;
  }

  const rate = Math.max(0.8, Math.min(1.8, options.rate || 1.05));
  const pitch = Math.max(0, Math.min(2, options.pitch || 1));

  // Récupérer les voix disponibles
  let voices = speechSynthesis.getVoices();

  // Attendre que les voix soient chargées (cas Chrome/Firefox)
  if (voices.length === 0) {
    await new Promise(resolve => {
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve();
      };
      // Forcer le chargement des voix
      speechSynthesis.getVoices();
    });
  }

  // Préférer une voix française
  const frenchVoice = voices.find(voice => 
    voice.lang.includes('fr') && 
    (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Delphine') || voice.name.includes('Hortense'))
  ) || voices.find(voice => voice.lang.includes('fr')) || voices[0];

  console.log(`🎙️ SpeechSynthesis lancé → Voix: ${frenchVoice?.name || 'Défaut'} | Langue: ${frenchVoice?.lang}`);

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.voice = frenchVoice;
  currentUtterance.rate = rate;
  currentUtterance.pitch = pitch;
  currentUtterance.volume = 0.95;

  currentUtterance.onend = () => {
    console.log("✅ Narration terminée");
    currentUtterance = null;
  };

  currentUtterance.onerror = (event) => {
    console.error("❌ Erreur SpeechSynthesis:", event);
    currentUtterance = null;
  };

  speechSynthesis.speak(currentUtterance);
}

/**
 * Arrête immédiatement la narration en cours
 */
export function stopNarration() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}

/**
 * Fonction simplifiée pour utilisation rapide
 */
export async function speak(text, voiceName = null) {
  await playNarration(text, { rate: 1.05 });
}

/**
 * Liste des voix (pour compatibilité avec ton select)
 * Note : les voix réelles sont chargées dynamiquement par le navigateur
 */
export const AVAILABLE_VOICES = [
  { id: 'fr-FR-DelphineNeural', name: 'Delphine — Féminine douce (recommandée)' },
  { id: 'fr-FR-HenriNeural', name: 'Henri — Masculin clair' },
  { id: 'fr-FR-AlainNeural', name: 'Alain — Masculin mature' },
  { id: 'fr-FR-CelesteNeural', name: 'Celeste — Féminine jeune' },
];