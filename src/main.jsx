// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataRefreshProvider } from './context/DataRefreshContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DataRefreshProvider>
        <App />
      </DataRefreshProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Enregistrement du Service Worker pour la PWA (version améliorée)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès - Scope:', registration.scope);
        
        // Mise à jour automatique quand une nouvelle version est disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                console.log('📦 Nouvelle version du Service Worker disponible');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log('❌ Échec de l\'enregistrement du Service Worker:', err);
      });
  });
}