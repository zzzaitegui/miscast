import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDaily } from '../services/api'
import { getRatingColor } from '../utils/ratingColor'
import './Home.css'

function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  )
}

function RatingCircle({ value, label }) {
  const color = getRatingColor(value)
  return (
    <div className="rating-circle-wrapper">
      <div className="rating-circle" style={{ background: color }}>
        <span className="rating-value">{value.toFixed(1)}</span>
      </div>
      <span className="rating-label">{label}</span>
    </div>
  )
}

export default function Home() {
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDaily()
      .then(setDaily)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="home-state">Loading...</div>
  if (!daily) return <div className="home-state">Could not load daily challenge.</div>

  const { film, targetRating } = daily
  const posterUrl = film.posterPath ? `https://image.tmdb.org/t/p/w500${film.posterPath}` : null

  return (
    <div className="home">
      <div className="film-card" onClick={() => navigate(`/game/${film.id}`)}>
        <div className="film-card-left">
          <div className="card-header">
            <CalendarIcon />
            <h2 className="card-title">Daily Challenge</h2>
          </div>
          <p className="card-description">
            Swap actors, directors, writers, DOP and composers from a film's roster to increase or decrease the rating.
          </p>
          <p className="card-film-name">Today's film: {film.title} ({film.year})</p>
          <div className="card-ratings">
            <RatingCircle value={film.tmdbRating} label="Rating" />
            <RatingCircle value={targetRating} label="Target rating" />
          </div>
        </div>
        {posterUrl && (
          <div className="film-card-right">
            <img src={posterUrl} alt={film.title} className="film-poster" />
          </div>
        )}
      </div>
      <p className="home-hint">Click to play...</p>
    </div>
  )
}
