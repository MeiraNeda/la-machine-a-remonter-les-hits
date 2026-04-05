// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-xl border-b border-neon-blue/40 shadow-[0_4px_30px_rgba(0,255,255,0.15)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.5)] group-hover:shadow-[0_0_35px_rgba(255,0,255,0.7)] transition-shadow duration-300">
              <span className="text-white font-black text-xl md:text-2xl">80s</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold neon-text tracking-widest group-hover:text-neon-pink transition-colors">
              MACHINE À HITS
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/map" 
              className="text-neon-green hover:text-neon-pink font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>🌍</span> Carte mondiale
            </Link>

            <Link 
              to="/movies" 
              className="text-neon-purple hover:text-neon-pink font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>🎬</span> Films & Séries
            </Link>

            <Link 
              to="/books" 
              className="text-neon-yellow hover:text-neon-pink font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>📖</span> Romans 80s
            </Link>

            {/* NOUVEAU : Dessins Animés */}
            <Link 
              to="/cartoons" 
              className="text-neon-cyan hover:text-neon-pink font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>📺</span> Dessins Animés
            </Link>
            
            <Link 
              to="/challenges" 
              className="text-neon-pink hover:text-neon-green font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>🏆</span> Défis & Classement
            </Link>

            {user && (
              <Link 
                to="/profile"
                className="text-neon-yellow hover:text-neon-green font-medium transition-colors duration-300 hover:scale-105 flex items-center gap-2"
              >
                <span>👤</span> Profil
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.8)] transition-shadow">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-300 font-medium hidden lg:inline">
                    {user.email?.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black px-7 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-105 animate-pulse-slow"
              >
                CONNEXION
              </Link>
            )}
          </nav>

          {/* Burger menu mobile */}
          <button
            className="md:hidden text-neon-pink text-3xl focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Menu mobile"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Overlay menu mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center md:hidden animate-fade-in"
          onClick={toggleMobileMenu}
        >
          <div className="flex flex-col items-center gap-10 text-2xl font-bold">
            <Link 
              to="/map" 
              className="text-neon-green hover:text-neon-pink transition-colors duration-300 hover:scale-110"
              onClick={toggleMobileMenu}
            >
              🌍 Carte mondiale
            </Link>

            <Link 
              to="/movies" 
              className="text-neon-purple hover:text-neon-pink transition-colors duration-300 hover:scale-110"
              onClick={toggleMobileMenu}
            >
              🎬 Films & Séries
            </Link>

            <Link 
              to="/books" 
              className="text-neon-yellow hover:text-neon-pink transition-colors duration-300 hover:scale-110"
              onClick={toggleMobileMenu}
            >
              📖 Romans 80s
            </Link>

            {/* NOUVEAU : Dessins Animés dans le menu mobile */}
            <Link 
              to="/cartoons" 
              className="text-neon-cyan hover:text-neon-pink transition-colors duration-300 hover:scale-110"
              onClick={toggleMobileMenu}
            >
              📺 Dessins Animés
            </Link>
            
            <Link 
              to="/challenges" 
              className="text-neon-pink hover:text-neon-green transition-colors duration-300 hover:scale-110"
              onClick={toggleMobileMenu}
            >
              🏆 Défis & Classement
            </Link>

            {user && (
              <Link 
                to="/profile"
                className="text-neon-yellow hover:text-neon-green transition-colors duration-300 hover:scale-110"
                onClick={toggleMobileMenu}
              >
                👤 Profil
              </Link>
            )}

            {user ? (
              <>
                <div className="text-gray-300 text-xl">
                  Connecté : {user.email?.split('@')[0]}
                </div>
                <button
                  onClick={() => {
                    signOut();
                    toggleMobileMenu();
                  }}
                  className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-10 py-4 rounded-xl text-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-neon-blue to-cyan-500 text-black px-10 py-4 rounded-xl text-xl hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all"
                onClick={toggleMobileMenu}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="h-20 md:h-24" />
    </>
  );
}