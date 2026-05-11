import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDaily } from '../services/api'
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

const COLOR_STOPS = [
  { r: 0,   rgb: [176, 0,   32]  },  // #B00020 — red
  { r: 2.5, rgb: [220, 80,  0]   },  // orange
  { r: 5,   rgb: [255, 185, 0]   },  // amber
  { r: 7.5, rgb: [30,  185, 92]  },  // #1EB95C — green
  { r: 10,  rgb: [28,  104, 204] },  // #1C68CC — blue
]

function getRatingColor(rating) {
  const v = Math.max(0, Math.min(10, rating))
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i], hi = COLOR_STOPS[i + 1]
    if (v <= hi.r) {
      const t = (v - lo.r) / (hi.r - lo.r)
      const r = Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * t)
      const g = Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * t)
      const b = Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * t)
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  return `rgb(${COLOR_STOPS.at(-1).rgb.join(',')})`
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

  if (loading) return <div className="home-state">Cargando...</div>
  if (!daily) return <div className="home-state">No se pudo cargar el reto diario.</div>

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
