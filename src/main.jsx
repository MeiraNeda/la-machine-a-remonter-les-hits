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

// Enregistrer le Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès');
      })
      .catch(err => {
        console.log('Échec enregistrement Service Worker:', err);
      });
  });
}