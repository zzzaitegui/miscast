import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Game from './pages/Game'
import Search from './pages/Search'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import Studio from './pages/Studio'
import StudioGame from './pages/StudioGame'
import Faceoff from './pages/Faceoff'
import FaceoffGame from './pages/FaceoffGame'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:filmId" element={<Game />} />
          <Route path="/daily" element={<DailyRedirect />} />
          <Route path="/search" element={<Search />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/studio/play" element={<StudioGame />} />
          <Route path="/faceoff" element={<Faceoff />} />
          <Route path="/faceoff/play" element={<FaceoffGame />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

function DailyRedirect() {
  return <Navigate to="/" replace />
}
