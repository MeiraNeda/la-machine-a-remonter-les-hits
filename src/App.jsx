// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';

// Pages principales
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import HitDetail from './pages/HitDetail';
import WorldMap from './pages/WorldMap';
import ChallengesAndLeaderboard from './components/ChallengesAndLeaderboard';
import CategoryPage from './pages/CategoryPage';
import MoviesSeriesPage from './pages/MoviesSeriesPage';
import BooksPage from './pages/BooksPage';          // ← NOUVEL IMPORT

// Pages des jeux
import QuickGame from './pages/QuickGame';
import BlindTest from './pages/BlindTest';
import YearQuiz from './pages/YearQuiz';
import LyricsFill from './pages/LyricsFill';
import ClipGuess from './pages/ClipGuess';
import ArtistOrBand from './pages/ArtistOrBand';
import TrueFalse80s from './pages/TrueFalse80s';
import Profile from './pages/Profile';
import MovieDetail from './pages/MovieDetail';
import BookDetail from './pages/BookDetail';
import CartoonsPage from './pages/CartoonsPage';
import CartoonDetail from './pages/CartoonDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-20 text-2xl">Chargement...</div>;

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/hit/:id" element={<HitDetail />} />
            <Route path="/movies" element={<MoviesSeriesPage />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/books" element={<BooksPage />} />           {/* ← NOUVELLE ROUTE */}
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/cartoons" element={<CartoonsPage />} />
            <Route path="/cartoon/:id" element={<CartoonDetail />} />
            <Route path="/map" element={<WorldMap />} />
            <Route path="/challenges" element={<ChallengesAndLeaderboard />} />
            <Route path="/category/:category" element={<CategoryPage />} />

            {/* Routes jeux */}
            <Route path="/game/quick" element={<QuickGame />} />
            <Route path="/game/blind-test" element={<BlindTest />} />
            <Route path="/game/year-quiz" element={<YearQuiz />} />
            <Route path="/game/lyrics-fill" element={<LyricsFill />} />
            <Route path="/game/clip-guess" element={<ClipGuess />} />
            <Route path="/game/artist-or-band" element={<ArtistOrBand />} />
            <Route path="/game/true-false" element={<TrueFalse80s />} />

            {/* Route Profil */}
            <Route path="/profile" element={<Profile />} />

            {/* Route admin protégée */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;