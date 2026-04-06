// src/components/WorldHitsMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicUrl } from '../lib/helpers';

// 🎵 Icône vinyle néon (inchangée)
const vinylIcon = new L.DivIcon({
  className: "vinyl-marker",
  html: `<div class="vinyl"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Coordonnées pays (inchangées)
const countryCoords = {
  USA: [37.0902, -95.7129],
  "United States": [37.0902, -95.7129],
  "United Kingdom": [55.3781, -3.436],
  Germany: [51.1657, 10.4515],
  Norway: [60.472, 8.4689],
  France: [46.2276, 2.2137],
  Sweden: [60.1282, 18.6435],
  Australia: [-25.2744, 133.7751],
  Canada: [56.1304, -106.3468],
  Italy: [41.8719, 12.5674],
  Japan: [36.2048, 138.2529]
};

export default function WorldHitsMap({ hits = [] }) {
  useEffect(() => {
    // Force resize Leaflet après rendu
    setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
  }, []);

  if (!hits.length) {
    return (
      <div className="text-center py-16 text-xl text-gray-400 bg-gray-900/40 rounded-2xl border border-neon-blue/30 mx-6">
        Aucun hit avec pays renseigné pour le moment...
      </div>
    );
  }

  const validHits = hits.filter(h => h.country && countryCoords[h.country]);

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="h-[600px] md:h-[700px] w-full rounded-3xl overflow-hidden border-4 border-neon-blue/50 shadow-[0_0_50px_rgba(0,255,255,0.35)] bg-black/50 backdrop-blur-sm">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={10}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          {/* Fond synthwave (inchangé) */}
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=fa3ed088-cdce-442a-9553-8ee15fe81453"
            attribution='© OpenStreetMap © Stadia Maps'
            // Optional: force retina if you want sharper tiles
            // detectRetina={true}
          />

          {/* Cluster des hits (légèrement amélioré visuellement) */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => {
              return new L.DivIcon({
                html: `<div class="cluster-icon neon-glow">${cluster.getChildCount()}</div>`,
                className: 'cluster-wrapper',
                iconSize: [48, 48]
              });
            }}
          >
            {validHits.map(hit => {
              const coords = countryCoords[hit.country];
              const imageUrl = hit.image_path ? getPublicUrl('images', hit.image_path) : null;

              return (
                <Marker
                  key={hit.id}
                  position={coords}
                  icon={vinylIcon}
                >
                  <Popup className="custom-popup">
                    <Link to={`/hit/${hit.id}`} className="block no-underline">
                      <div className="w-72 md:w-80 p-2">
                        {imageUrl && (
                          <div className="overflow-hidden rounded-xl mb-4 shadow-lg">
                            <img
                              src={imageUrl}
                              alt={hit.title}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <h3 className="text-2xl font-bold text-neon-pink neon-text mb-2 truncate">
                          {hit.title}
                        </h3>

                        <p className="text-lg text-gray-200 mb-1">
                          {hit.artist}
                        </p>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neon-green">{hit.year}</span>
                          <span className="text-neon-blue italic">Origine : {hit.country}</span>
                        </div>

                        <div className="mt-5 text-center">
                          <span className="inline-block bg-neon-purple/70 text-white px-6 py-3 rounded-xl font-bold hover:bg-neon-purple transition-colors">
                            Découvrir le hit →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <p className="text-center text-base text-gray-400 mt-6 italic">
        Clique sur les vinyles pour plonger dans l’histoire de chaque tube iconique des 80s
      </p>
    </div>
  );
}