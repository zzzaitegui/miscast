import { useState, useEffect, useRef } from 'react'
import { searchPersons } from '../services/api'
import { getRatingColor } from '../utils/ratingColor'
import './SwapModal.css'

const ROLE_LABELS = {
  director: 'Directors',
  actor: 'Actors',
  writer: 'Writers',
  dop: 'DoP',
  composer: 'Composers',
}

function getRoleRating(person, role) {
  return { actor: person.actorRating, director: person.directorRating, writer: person.writerRating, dop: person.dopRating, composer: person.composerRating }[role] ?? null
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function SwapModal({ role, currentPerson, onSwap, onClose, occupiedPersonIds = new Set() }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchPersons(query, role)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, role])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const currentPhotoUrl = currentPerson.profilePath
    ? `https://image.tmdb.org/t/p/w185${currentPerson.profilePath}`
    : null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-role-label">Swapping {ROLE_LABELS[role]}</span>
            <div className="modal-current-person">
              {currentPhotoUrl
                ? <img src={currentPhotoUrl} alt={currentPerson.name} className="modal-current-photo" />
                : <div className="modal-current-photo modal-photo-placeholder" />
              }
              <span className="modal-current-name">{currentPerson.name}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <input
          ref={inputRef}
          className="modal-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name..."
        />

        <div className="modal-results">
          {searching && (
            <p className="modal-status">Searching...</p>
          )}
          {!searching && query.trim() && results.length === 0 && (
            <p className="modal-status">No results found.</p>
          )}
          {!searching && !query.trim() && (
            <p className="modal-status">Type a name to search.</p>
          )}
          {results.filter(person => !occupiedPersonIds.has(person.id)).map(person => {
            const rating = getRoleRating(person, role)
            const photoUrl = person.profilePath
              ? `https://image.tmdb.org/t/p/w185${person.profilePath}`
              : null
            return (
              <div key={person.id} className="modal-result" onClick={() => onSwap(person)}>
                <div className="modal-result-photo-wrapper">
                  {photoUrl
                    ? <img src={photoUrl} alt={person.name} className="modal-result-photo" />
                    : <div className="modal-result-photo modal-photo-placeholder" />
                  }
                </div>
                <span className="modal-result-name">{person.name}</span>
                {rating !== null && (
                  <span
                    className="modal-result-rating"
                    style={{ background: getRatingColor(rating) }}
                  >
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
