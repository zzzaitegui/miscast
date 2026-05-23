import { useState, useEffect, useRef } from 'react'
import { getRatingColor } from '../utils/ratingColor'
import { getLeaderboard } from '../services/api'
import './Leaderboard.css'

const ROLES = [
  { value: 'actor',    label: 'Actors' },
  { value: 'director', label: 'Directors' },
  { value: 'writer',   label: 'Writers' },
  { value: 'dop',      label: 'Cinematographers' },
  { value: 'composer', label: 'Composers' },
]


function PodiumIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="6" height="14" rx="1" />
      <rect x="9" y="3" width="6" height="19" rx="1" />
      <rect x="16" y="12" width="6" height="10" rx="1" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function RoleSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = ROLES.find(r => r.value === value)

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div className="role-selector" ref={ref}>
      <button className="filter-pill" onClick={() => setOpen(o => !o)}>
        <span className="filter-text">{current.label}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="role-dropdown">
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`role-option${r.value === value ? ' active' : ''}`}
              onClick={() => { onChange(r.value); setOpen(false) }}
            >
              <span className="filter-text">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PersonPhoto({ profilePath, name }) {
  const [err, setErr] = useState(false)
  if (profilePath && !err) {
    return (
      <img
        className="lb-photo"
        src={`https://image.tmdb.org/t/p/w185${profilePath}`}
        alt={name}
        onError={() => setErr(true)}
      />
    )
  }
  return (
    <div className="lb-photo lb-photo-placeholder">
      <span>{name?.charAt(0) ?? '?'}</span>
    </div>
  )
}

function FilmPoster({ film }) {
  const [err, setErr] = useState(false)
  if (!film) return null
  const color = getRatingColor(film.tmdbRating)
  return (
    <div className="lb-poster-wrap">
      {film.posterPath && !err
        ? <img className="lb-poster" src={`https://image.tmdb.org/t/p/w185${film.posterPath}`} alt={film.title} onError={() => setErr(true)} />
        : <div className="lb-poster lb-poster-placeholder" />
      }
      {film.tmdbRating != null && (
        <span className="lb-poster-rating" style={{ background: color }}>
          {film.tmdbRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank }) {
  const rating = entry.rating
  const credits = entry.creditCount ?? 0
  const color = getRatingColor(rating)

  return (
    <div className="leaderboard-row">
      <span className="lb-rank">{rank}.</span>

      <div className="lb-person">
        <PersonPhoto profilePath={entry.profilePath} name={entry.name} />
        <div className="lb-person-info">
          <div className="lb-rating" style={{ background: color }}>
            <span className="lb-rating-text">{rating != null ? rating.toFixed(1) : '–'}</span>
          </div>
          <span className="lb-name">{entry.name}</span>
        </div>
      </div>

      <div className="lb-credits">
        <span className="lb-credits-text">{credits} credits</span>
      </div>

      <div className="lb-film">
        <span className="lb-film-label">
          Most known film:{entry.bestFilm ? ` ${entry.bestFilm.title}` : ''}
        </span>
        <FilmPoster film={entry.bestFilm} />
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [role, setRole]             = useState('actor')
  const [minCredits, setMinCredits] = useState('50')
  const [minYear, setMinYear]       = useState('')
  const [maxYear, setMaxYear]       = useState('')
  const [entries, setEntries]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)

  useEffect(() => {
    const hasYear = minYear || maxYear
    const t = setTimeout(() => {
      setLoading(true)
      setError(false)
      getLeaderboard(role, minYear || undefined, maxYear || undefined)
        .then(data => { setEntries(data); setError(false) })
        .catch(() => { setEntries([]); setError(true) })
        .finally(() => setLoading(false))
    }, hasYear ? 500 : 0)
    return () => clearTimeout(t)
  }, [role, minYear, maxYear])

  const minC = minCredits !== '' && !isNaN(Number(minCredits)) ? Number(minCredits) : 0
  const filtered = entries.filter(e => (e.creditCount ?? 0) >= minC)

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-card">

        <div className="leaderboard-top">
          <div className="leaderboard-title-row">
            <span className="leaderboard-icon-color"><PodiumIcon /></span>
            <h1 className="leaderboard-title">Leaderboard</h1>
          </div>
          <div className="leaderboard-filters">
            <RoleSelector value={role} onChange={setRole} />
            <div className="filter-pill">
              <span className="filter-text">Credits:</span>
              <input
                type="number"
                className="filter-input"
                value={minCredits}
                onChange={e => setMinCredits(e.target.value)}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="filter-pill year-pill">
              <input
                type="number"
                className="filter-input year-input"
                value={minYear}
                onChange={e => setMinYear(e.target.value)}
                placeholder="2010"
              />
              <span className="year-divider" />
              <input
                type="number"
                className="filter-input year-input"
                value={maxYear}
                onChange={e => setMaxYear(e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="leaderboard-state">Loading...</div>
        ) : error ? (
          <div className="leaderboard-state">Could not load leaderboard.</div>
        ) : filtered.length === 0 ? (
          <div className="leaderboard-state">No results for these filters.</div>
        ) : (
          <div className="leaderboard-list">
            {filtered.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
