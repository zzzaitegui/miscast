import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRatingColor } from '../utils/ratingColor'
import SwapModal from '../components/SwapModal'
import './Game.css'
import './StudioGame.css'

const ROLE_ORDER = ['director', 'actor', 'writer', 'dop', 'composer']
const ROLE_LABELS = {
  director: 'Directors',
  actor: 'Actors',
  writer: 'Writers',
  dop: 'DoP',
  composer: 'Composers',
}
const ROLE_WEIGHTS = { director: 10, writer: 5, actor: 3, dop: 2, composer: 1 }
const ROLE_CAPS = { director: 10, actor: 30, writer: 10, dop: 10, composer: 10 }
const GLOBAL_MEAN = 6.5

function getRoleRating(person, role) {
  return { actor: person.actorRating, director: person.directorRating, writer: person.writerRating, dop: person.dopRating, composer: person.composerRating }[role] ?? null
}

function slotDelta(slot) {
  if (slot.type !== 'filled') return 0
  const rating = getRoleRating(slot.person, slot.role) ?? GLOBAL_MEAN
  return (ROLE_WEIGHTS[slot.role] ?? 1) * (rating - GLOBAL_MEAN) * 0.04
}

function FilmCameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3V10z" />
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

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function EmptySlotCard({ onClick }) {
  return (
    <div className="person-card" onClick={onClick}>
      <div className="person-photo-wrapper">
        <div className="person-photo studio-empty-photo">
          <PlusIcon />
        </div>
        <div className="card-overlay">
          <span className="swap-label">SWAP</span>
        </div>
      </div>
      <p className="person-name studio-empty-name">Empty</p>
    </div>
  )
}

function FilledSlotCard({ slot, onReset, onClick }) {
  const rating = getRoleRating(slot.person, slot.role)
  const photoUrl = slot.person.profilePath
    ? `https://image.tmdb.org/t/p/w185${slot.person.profilePath}`
    : null
  return (
    <div className="person-card" onClick={onClick}>
      <button
        className="reset-btn"
        onClick={e => { e.stopPropagation(); onReset(slot) }}
        title="Remove"
      >×</button>
      <div className="person-photo-wrapper">
        {photoUrl
          ? <img src={photoUrl} alt={slot.person.name} className="person-photo" />
          : <div className="person-photo person-photo-placeholder"><PersonIcon /></div>
        }
        <div className="card-overlay">
          <span className="swap-label">SWAP</span>
        </div>
        <div
          className="person-rating-badge"
          style={{ background: rating !== null ? getRatingColor(rating) : '#555' }}
        >
          {rating !== null ? rating.toFixed(1) : '-'}
        </div>
      </div>
      <p className="person-name">{slot.person.name}</p>
    </div>
  )
}

function StudioRoleGroup({ role, roleSlots, onSlotClick, onSlotReset }) {
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
  }, [checkScroll, roleSlots])

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
          {roleSlots.map(slot =>
            slot.type === 'empty'
              ? <EmptySlotCard key={slot.id} onClick={() => onSlotClick(slot)} />
              : <FilledSlotCard key={slot.id} slot={slot} onClick={() => onSlotClick(slot)} onReset={onSlotReset} />
          )}
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

export default function StudioGame() {
  const navigate = useNavigate()
  const idRef = useRef(ROLE_ORDER.length)

  const [title, setTitle] = useState('Untitled')
  const [editingTitle, setEditingTitle] = useState(false)
  const titleInputRef = useRef(null)

  const [slots, setSlots] = useState(() => {
    const s = {}
    ROLE_ORDER.forEach((role, i) => { s[role] = [{ id: i + 1, role, type: 'empty' }] })
    return s
  })

  const [swapTarget, setSwapTarget] = useState(null)
  const [posterDataUrl, setPosterDataUrl] = useState(null)
  const [posterError, setPosterError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.select()
  }, [editingTitle])

  const allSlots = Object.values(slots).flat()
  const predictedRating = Math.max(1, Math.min(10,
    GLOBAL_MEAN + allSlots.reduce((sum, s) => sum + slotDelta(s), 0)
  ))

  function confirmTitle() {
    setTitle(t => t.trim() || 'Untitled')
    setEditingTitle(false)
  }

  function handleModalSwap(newPerson) {
    if (!swapTarget) return
    const role = swapTarget.role
    if (swapTarget.type === 'empty') {
      setSlots(prev => {
        let roleSlots = prev[role].map(s =>
          s.id === swapTarget.id ? { ...s, type: 'filled', person: newPerson } : s
        )
        const cap = ROLE_CAPS[role]
        const filledCount = roleSlots.filter(s => s.type === 'filled').length
        const hasEmpty = roleSlots.some(s => s.type === 'empty')
        if (!hasEmpty && filledCount < cap) {
          roleSlots = [...roleSlots, { id: ++idRef.current, role, type: 'empty' }]
        }
        return { ...prev, [role]: roleSlots }
      })
    } else {
      setSlots(prev => ({
        ...prev,
        [role]: prev[role].map(s =>
          s.id === swapTarget.id ? { ...s, person: newPerson } : s
        )
      }))
    }
    setSwapTarget(null)
  }

  function handleReset(slot) {
    const role = slot.role
    setSlots(prev => {
      let roleSlots = prev[role].filter(s => s.id !== slot.id)
      const cap = ROLE_CAPS[role]
      const filledCount = roleSlots.filter(s => s.type === 'filled').length
      const hasEmpty = roleSlots.some(s => s.type === 'empty')
      if (!hasEmpty && filledCount < cap) {
        roleSlots = [...roleSlots, { id: ++idRef.current, role, type: 'empty' }]
      }
      return { ...prev, [role]: roleSlots }
    })
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > 8 * 1024 * 1024) {
      setPosterError('File too large. Max 8 MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (img.width < 300 || img.height < 450) {
        setPosterError('Image too small. Min 300×450 px.')
        return
      }
      const targetAspect = 2 / 3
      const srcAspect = img.width / img.height
      let sx, sy, sw, sh
      if (srcAspect > targetAspect) {
        sh = img.height
        sw = Math.round(img.height * targetAspect)
        sx = Math.round((img.width - sw) / 2)
        sy = 0
      } else {
        sw = img.width
        sh = Math.round(img.width / targetAspect)
        sx = 0
        sy = Math.round((img.height - sh) / 2)
      }
      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      setPosterError(null)
      setPosterDataUrl(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setPosterError('Could not load image.')
    }
    img.src = objectUrl
  }

  const occupiedPersonIds = new Set()

  return (
    <div className="game">
      <div className="game-card">

        <div className="game-card-left">
          <div className="game-header">
            <div className="game-title-row">
              <FilmCameraIcon />
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  className="studio-title-input"
                  value={title}
                  onChange={e => setTitle(e.target.value.slice(0, 100))}
                  onBlur={confirmTitle}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmTitle() } }}
                />
              ) : (
                <h2 className="game-title studio-title-editable" onClick={() => setEditingTitle(true)}>
                  {title}
                </h2>
              )}
            </div>
            <p className="game-description">Build your own movie from scratch. No rules.</p>
          </div>
          <div className="role-groups">
            {ROLE_ORDER.map(role => (
              <StudioRoleGroup
                key={role}
                role={role}
                roleSlots={slots[role]}
                onSlotClick={setSwapTarget}
                onSlotReset={handleReset}
              />
            ))}
          </div>
        </div>

        <div className="game-card-right">
          <div
            className="studio-poster-area game-poster-wrapper"
            onClick={() => fileInputRef.current?.click()}
          >
            {posterDataUrl
              ? <img src={posterDataUrl} alt="Custom poster" className="game-poster" />
              : <div className="studio-poster-placeholder"><PlusIcon /></div>
            }
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <p className={`studio-poster-hint${posterError ? ' studio-poster-error' : ''}`}>
            {posterError || '2:3 ratio · max 8 MB · min 300×450 px'}
          </p>

          <div className="ratings-row">
            <div className="rating-cell studio-rating-cell" style={{ background: getRatingColor(predictedRating) }}>
              <span className="rating-cell-value">{predictedRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="ratings-labels">
            <span>Rating</span>
          </div>

          <button className="submit-btn" onClick={() => navigate('/studio')}>
            Submit
          </button>
        </div>

      </div>

      {swapTarget && (
        <SwapModal
          role={swapTarget.role}
          currentPerson={swapTarget.type === 'filled' ? swapTarget.person : null}
          studioMode={swapTarget.type === 'empty'}
          onSwap={handleModalSwap}
          onClose={() => setSwapTarget(null)}
          occupiedPersonIds={occupiedPersonIds}
        />
      )}
    </div>
  )
}
