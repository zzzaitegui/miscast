import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFilms, searchFilms } from '../services/api'
import { getRatingColor } from '../utils/ratingColor'
import './Search.css'

function CubeIcon() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function FilmCard({ film }) {
  const navigate = useNavigate()
  const posterUrl = film.posterPath ? `https://image.tmdb.org/t/p/w500${film.posterPath}` : null
  const color = getRatingColor(film.tmdbRating)

  return (
    <div className="film-thumb" onClick={() => navigate(`/game/${film.id}`)}>
      <div className="film-thumb-poster-area">
        {posterUrl ? (
          <img src={posterUrl} alt={film.title} className="film-thumb-poster" loading="lazy" />
        ) : (
          <div className="film-thumb-placeholder" />
        )}
        <div className="film-thumb-poster-footer">
          <span className="film-thumb-year">{film.year}</span>
          <div className="film-thumb-rating" style={{ background: color }}>
            {film.tmdbRating?.toFixed(1) ?? '—'}
          </div>
        </div>
      </div>
      <p className="film-thumb-title">{film.title}</p>
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [allFilms, setAllFilms] = useState([])
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef(null)

  useEffect(() => {
    getFilms(0, 300)
      .then(page => {
        setAllFilms(page.content)
        setFilms(page.content)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(val) {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = val.trim()
      if (trimmed.length >= 2) {
        searchFilms(trimmed).then(setFilms).catch(() => {})
      } else {
        setFilms(allFilms)
      }
    }, 300)
  }

  return (
    <div className="search-page">
      <div className="custom-card">
        <div className="custom-card-header">
          <CubeIcon />
          <h1 className="custom-card-title">Custom</h1>
        </div>
        <p className="custom-card-subtitle">Pick a film and swap as many people as you want to experiment in sandbox mode.</p>

        <div className="search-bar">
          <span className="search-bar-icon"><SearchIcon /></span>
          <input
            className="search-bar-input"
            placeholder="Search by title..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {!loading && (
            <span className="search-bar-count">{films.length} films</span>
          )}
        </div>

        <div className="films-grid">
          {loading ? (
            <div className="search-state">Loading films...</div>
          ) : films.length === 0 ? (
            <div className="search-state">No films found for "{query}".</div>
          ) : (
            films.map(film => <FilmCard key={film.id} film={film} />)
          )}
        </div>
      </div>

      <p className="search-page-hint">Pick a film to play...</p>
    </div>
  )
}
