// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Inscription réussie ! Connectez-vous maintenant.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Fond animé subtil 80s */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-blue-950 opacity-80 animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-4 p-8 mt-10 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold neon-text mb-10 text-center tracking-wider">
          {isSignUp ? 'INSCRIPTION' : 'CONNEXION'} 80s
        </h1>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-8 bg-gray-950/80 backdrop-blur-md p-10 rounded-2xl border border-neon-blue/30 shadow-[0_0_40px_rgba(0,255,255,0.2)]"
        >
          {/* Champ email */}
          <div className="relative">
            <label className="block mb-3 text-neon-blue font-bold text-lg">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="exemple@mtv80s.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-5 pl-14 bg-black/70 border border-neon-blue/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50 transition-all duration-300"
              />
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neon-blue text-xl">✉️</span>
            </div>
          </div>

          {/* Champ mot de passe */}
          <div className="relative">
            <label className="block mb-3 text-neon-pink font-bold text-lg">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-5 pl-14 bg-black/70 border border-neon-pink/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/50 transition-all duration-300"
              />
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neon-pink text-xl">🔒</span>
            </div>
          </div>

          {/* Bouton principal */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 px-8 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-green to-neon-blue text-black hover:shadow-[0_0_40px_rgba(0,255,128,0.6)]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-full" />
                Chargement...
              </span>
            ) : isSignUp ? "S'inscrire" : 'Se connecter'}
          </button>

          {/* Toggle inscription / connexion */}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-neon-pink hover:text-neon-green font-bold text-lg mt-4 transition-colors duration-300 hover:underline"
          >
            {isSignUp 
              ? 'Déjà un compte ? Connectez-vous' 
              : 'Pas de compte ? Inscrivez-vous'}
          </button>

          {/* Erreur */}
          {error && (
            <div className="bg-red-950/50 border border-red-600/50 text-red-300 p-5 rounded-xl text-center font-medium">
              {error}
            </div>
          )}
        </form>

        {/* Petit texte légal / ambiance */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Back to the 80s – Feel the beat
        </p>
      </div>
    </div>
  );
}