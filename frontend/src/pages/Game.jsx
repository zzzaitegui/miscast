import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFilm, getDaily, saveMatch } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getRatingColor } from '../utils/ratingColor'
import SwapModal from '../components/SwapModal'
import './Game.css'

const ROLE_ORDER = ['director', 'actor', 'writer', 'dop', 'composer']
const ROLE_LABELS = {
  director: 'Directors',
  actor: 'Actors',
  writer: 'Writers',
  dop: 'DoP',
  composer: 'Composers',
}

const ROLE_WEIGHTS = { director: 10, writer: 5, actor: 3, dop: 2, composer: 1 }
const GLOBAL_MEAN  = 6.5
const IMPACT_SCALE = 0.04

function getRoleRating(person, role) {
  return { actor: person.actorRating, director: person.directorRating, writer: person.writerRating, dop: person.dopRating, composer: person.composerRating }[role] ?? null
}

function swapImpact(oldPerson, newPerson, role) {
  const oldR = getRoleRating(oldPerson, role) ?? GLOBAL_MEAN
  const newR = getRoleRating(newPerson, role) ?? GLOBAL_MEAN
  return (ROLE_WEIGHTS[role] ?? 1) * (newR - oldR) * IMPACT_SCALE
}

function ClapperboardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="14" rx="2" />
      <path d="M2 12h20" />
      <path d="M6 8V4l4 2 4-2 4 2V8" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  )
}

function PersonCard({ slot, onClick, onReset }) {
  const rating = getRoleRating(slot.person, slot.role)
  const photoUrl = slot.person.profilePath
    ? `https://image.tmdb.org/t/p/w185${slot.person.profilePath}`
    : null

  return (
    <div className={`person-card${slot.isSwapped ? ' swapped' : ''}`} onClick={onClick}>
      {slot.isSwapped && (
        <button
          className="reset-btn"
          onClick={e => { e.stopPropagation(); onReset(slot) }}
          title="Reset to original"
        >×</button>
      )}
      <div className="person-photo-wrapper">
        {photoUrl
          ? <img src={photoUrl} alt={slot.person.name} className="person-photo" />
          : <div className="person-photo person-photo-placeholder"><PersonIcon /></div>
        }
        <div className="card-overlay">
          <span className="swap-label">SWAP</span>
        </div>
        <div className="person-rating-badge" style={{ background: rating !== null ? getRatingColor(rating) : '#555' }}>
          {rating !== null ? rating.toFixed(1) : '-'}
        </div>
      </div>
      <p className="person-name">{slot.person.name}</p>
    </div>
  )
}

function RoleGroup({ role, slots, onSlotClick, onSlotReset }) {
  const listRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 1)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [checkScroll, slots])

  function scroll(dir) {
    listRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  return (
    <div className="role-group">
      <h3 className="role-label">{ROLE_LABELS[role]}</h3>
      <div className="role-list-wrapper">
        {canLeft && (
          <button className="arrow-btn arrow-left" onClick={() => scroll(-1)}>
            <ChevronLeft />
          </button>
        )}
        <div className="role-list" ref={listRef} onScroll={checkScroll}>
          {slots.map(slot => (
            <PersonCard key={slot.id} slot={slot} onClick={() => onSlotClick(slot)} onReset={onSlotReset} />
          ))}
        </div>
        {canRight && (
          <button className="arrow-btn arrow-right" onClick={() => scroll(1)}>
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Game() {
  const { filmId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [film, setFilm] = useState(null)
  const [isDaily, setIsDaily] = useState(false)
  const [targetRating, setTargetRating] = useState(null)
  const [roster, setRoster] = useState([])
  const [initialRating, setInitialRating] = useState(null)
  const [swapsUsed, setSwapsUsed] = useState(0)
  const [swapDelta, setSwapDelta] = useState(0)
  const [swapTarget, setSwapTarget] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [filmData, dailyData] = await Promise.all([
          getFilm(filmId),
          getDaily().catch(() => null),
        ])
        setFilm(filmData)

        const isDailyMode = dailyData && dailyData.filmId === parseInt(filmId)
        setIsDaily(isDailyMode)
        if (isDailyMode) setTargetRating(dailyData.targetRating)

        const seen = new Set()
        const initialRoster = filmData.filmPersons
          .filter(fp => { if (seen.has(fp.id)) return false; seen.add(fp.id); return true })
          .map(fp => ({ ...fp, isSwapped: false, originalPerson: fp.person }))
        setRoster(initialRoster)
        const filmBase = filmData.adjustedRating ?? filmData.tmdbRating ?? 5
        setInitialRating(filmBase)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filmId])

  const filmBase = film ? (film.adjustedRating ?? film.tmdbRating ?? 5) : 5
  const predictedRating = Math.max(1, Math.min(10, filmBase + swapDelta))

  function openSwap(slot) {
    if (gameOver || (isDaily && swapsUsed >= 10)) return
    setSwapTarget(slot)
  }

  function handleSwap(newPerson) {
    if (!swapTarget || gameOver || (isDaily && swapsUsed >= 10)) return
    setSwapDelta(prev => prev + swapImpact(swapTarget.person, newPerson, swapTarget.role))
    setRoster(prev => prev.map(s =>
      s.id === swapTarget.id ? { ...s, person: newPerson, isSwapped: true } : s
    ))
    setSwapsUsed(prev => prev + 1)
    setSwapTarget(null)
  }

  function handleReset(slot) {
    if (gameOver) return
    setSwapDelta(prev => prev + swapImpact(slot.person, slot.originalPerson, slot.role))
    setRoster(prev => prev.map(s =>
      s.id === slot.id ? { ...s, person: s.originalPerson, isSwapped: false } : s
    ))
    setSwapsUsed(prev => Math.max(0, prev - 1))
  }

  function handleSubmit() {
    if (gameOver) return
    const current = predictedRating
    let didWin = false
    if (isDaily && targetRating !== null) {
      const base = film.adjustedRating ?? film.tmdbRating
      didWin = targetRating >= base ? current >= targetRating : current <= targetRating
    }
    setWon(isDaily ? didWin : null)
    setGameOver(true)

    if (token) {
      saveMatch({
        filmId: parseInt(filmId),
        targetRating: isDaily ? targetRating : null,
        finalRating: current,
        swapsUsed,
        won: isDaily ? didWin : false,
        mode: isDaily ? 'daily' : 'sandbox',
      }).catch(() => {})
    }

    setTimeout(() => navigate('/'), 3000)
  }

  const groupedRoster = ROLE_ORDER
    .map(role => ({
      role,
      slots: roster.filter(s => s.role === role).sort((a, b) => a.billingOrder - b.billingOrder),
    }))
    .filter(g => g.slots.length > 0)

  if (loading) return <div className="game-state">Loading...</div>
  if (!film) return <div className="game-state">Could not load film.</div>

  const posterUrl = film.posterPath ? `https://image.tmdb.org/t/p/w500${film.posterPath}` : null
  const showTarget = isDaily && targetRating !== null

  return (
    <div className="game">
      <div className="game-card">

        <div className="game-card-left">
          <div className="game-header">
            <div className="game-title-row">
              <ClapperboardIcon />
              <h2 className="game-title">{film.title} ({film.year})</h2>
            </div>
            <p className="game-description">
              Swap actors, directors, writers, DOP and composers from a film's roster to increase or decrease the rating.
            </p>
          </div>
          <div className="role-groups">
            {groupedRoster.map(({ role, slots }) => (
              <RoleGroup key={role} role={role} slots={slots} onSlotClick={openSwap} onSlotReset={handleReset} />
            ))}
          </div>
        </div>

        <div className="game-card-right">
          {posterUrl && (
            <div className="game-poster-wrapper">
              <img src={posterUrl} alt={film.title} className="game-poster" />
            </div>
          )}

          <div className="ratings-row">
            <div className="rating-cell rating-cell-left" style={{ background: getRatingColor(initialRating) }}>
              <span className="rating-cell-value">{initialRating?.toFixed(1)}</span>
            </div>
            <div
              className={`rating-cell ${showTarget ? 'rating-cell-mid' : 'rating-cell-right'}`}
              style={{ background: getRatingColor(predictedRating) }}
            >
              <span className="rating-cell-value">{predictedRating.toFixed(1)}</span>
            </div>
            {showTarget && (
              <div className="rating-cell rating-cell-right" style={{ background: getRatingColor(targetRating) }}>
                <span className="rating-cell-value">{targetRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="ratings-labels">
            <span>Original</span>
            <span>Current</span>
            {showTarget && <span>Target</span>}
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={gameOver}>
            Submit
          </button>

          <p className="swap-counter">{isDaily ? `${swapsUsed}/10 swaps` : `${swapsUsed} swap${swapsUsed !== 1 ? 's' : ''}`}</p>

        </div>

        {gameOver && isDaily && won !== null && (
          <div className={`game-overlay ${won ? 'game-overlay-win' : 'game-overlay-loss'}`}>
            <span className="game-overlay-text">{won ? 'You won!' : 'You lost!'}</span>
          </div>
        )}

      </div>

      {swapTarget && (
        <SwapModal
          role={swapTarget.role}
          currentPerson={swapTarget.person}
          onSwap={handleSwap}
          onClose={() => setSwapTarget(null)}
          occupiedPersonIds={new Set(roster.filter(s => s.id !== swapTarget.id).map(s => s.person.id))}
        />
      )}
    </div>
  )
}
