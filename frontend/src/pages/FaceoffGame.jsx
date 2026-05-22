import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getFaceoffMovies, getFaceoffPersons } from '../services/api'
import './FaceoffGame.css'

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const RATING_STOPS = [
  [0,   [176,   0,  32]],
  [2.5, [220,  80,   0]],
  [5,   [255, 185,   0]],
  [7.5, [ 30, 185,  92]],
  [10,  [ 28, 104, 204]],
]

function ratingColor(v) {
  const val = Math.max(0, Math.min(10, v))
  for (let i = 1; i < RATING_STOPS.length; i++) {
    const [lo, cLo] = RATING_STOPS[i - 1]
    const [hi, cHi] = RATING_STOPS[i]
    if (val <= hi) {
      const t = (val - lo) / (hi - lo)
      return `rgb(${cLo.map((c, k) => Math.round(c + t * (cHi[k] - c))).join(',')})`
    }
  }
  return `rgb(28,104,204)`
}

// Log scale: 1,000 votes → red (0), 15,000+ votes → blue (10)
function voteCountColor(count) {
  const score = Math.max(0, Math.min(10,
    (Math.log10(Math.max(count, 1000)) - 3) / (Math.log10(20000) - 3) * 10
  ))
  return ratingColor(score)
}

function formatValue(value, metric) {
  if (metric === 'votes') return Math.round(value).toLocaleString()
  return Number(value).toFixed(1)
}

const ROLE_LABEL = { actor: 'Actor', director: 'Director', writer: 'Writer', dop: 'DoP', composer: 'Composer' }

// ── Sub-components ─────────────────────────────────────────────────────────

function ScaleIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M4 8h16" />
      <path d="M6 8l-3 6h6l-3-6z" />
      <path d="M18 8l-3 6h6l-3-6z" />
    </svg>
  )
}

function RatingBadge({ value, hidden, metric }) {
  if (hidden) {
    return <div className="fo-badge fo-badge-hidden">???</div>
  }
  const color = metric === 'votes' ? voteCountColor(value) : ratingColor(value)
  return (
    <div className="fo-badge" style={{ background: color }}>
      {formatValue(value, metric)}
    </div>
  )
}

function PersonCard({ card, size, revealed, displayedValue, isRight }) {
  const imgSrc = card.profilePath
    ? `https://image.tmdb.org/t/p/w185${card.profilePath}`
    : null

  return (
    <div className={`fo-card fo-card-${size}`}>
      {size === 'side' && <div className="fo-side-overlay" />}
      {isRight && <span className="fo-does">Does...</span>}
      {!isRight && <span className="fo-does-spacer" />}
      <div className={`fo-photo fo-photo-${size}`}>
        {imgSrc
          ? <img src={imgSrc} alt={card.name} />
          : <div className="fo-photo-placeholder" />}
      </div>
      <span className="fo-name">{card.name}</span>
      {card.mainRole && <span className="fo-role">{ROLE_LABEL[card.mainRole] ?? card.mainRole}</span>}
      {revealed
        ? <RatingBadge value={displayedValue ?? card.mainRoleRating} metric="rating" />
        : <RatingBadge hidden />}
    </div>
  )
}

function MovieCard({ card, size, revealed, displayedValue, metric, isRight }) {
  const imgSrc = card.posterPath
    ? `https://image.tmdb.org/t/p/w500${card.posterPath}`
    : null

  const rawValue = metric === 'votes' ? card.voteCount : card.tmdbRating

  return (
    <div className={`fo-card fo-card-movie fo-card-${size}`}>
      {size === 'side' && <div className="fo-side-overlay" />}
      {isRight && <span className="fo-does">Does...</span>}
      {!isRight && <span className="fo-does-spacer" />}
      <div className={`fo-photo fo-photo-movie fo-photo-${size}`}>
        {imgSrc
          ? <img src={imgSrc} alt={card.title} />
          : <div className="fo-photo-placeholder" />}
      </div>
      <span className="fo-name">{card.title}</span>
      <span className="fo-role">{card.year}</span>
      {revealed
        ? <RatingBadge value={displayedValue ?? rawValue} metric={metric} />
        : <RatingBadge hidden />}
    </div>
  )
}

function Card({ card, size, revealed, displayedValue, metric, isRight, category }) {
  if (!card) return <div className={`fo-card fo-card-${size} fo-card-empty`} />
  if (category === 'people') {
    return <PersonCard card={card} size={size} revealed={revealed} displayedValue={displayedValue} metric={metric} isRight={isRight} />
  }
  return <MovieCard card={card} size={size} revealed={revealed} displayedValue={displayedValue} metric={metric} isRight={isRight} />
}

function GameOverOverlay({ score, leftCard, rightCard, metric, category, onPlayAgain, onExit }) {
  function getVal(card) {
    if (category === 'people') return card?.mainRoleRating
    return metric === 'votes' ? card?.voteCount : card?.tmdbRating
  }

  return (
    <div className="fo-gameover">
      <div className="fo-gameover-score">{score}</div>
      <div className="fo-gameover-label">Final Score</div>
      <div className="fo-gameover-cards">
        <div className="fo-gameover-card">
          <span className="fo-gameover-card-name">{leftCard?.name ?? leftCard?.title}</span>
          <RatingBadge value={getVal(leftCard)} metric={metric} revealed />
        </div>
        <span className="fo-gameover-vs">vs.</span>
        <div className="fo-gameover-card">
          <span className="fo-gameover-card-name">{rightCard?.name ?? rightCard?.title}</span>
          <RatingBadge value={getVal(rightCard)} metric={metric} revealed />
        </div>
      </div>
      <div className="fo-gameover-buttons">
        <button className="fo-gameover-btn fo-gameover-btn-play" onClick={onPlayAgain}>Play Again</button>
        <button className="fo-gameover-btn fo-gameover-btn-exit" onClick={onExit}>Exit</button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FaceoffGame() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const category = params.get('category') ?? 'movies'
  const metric = params.get('metric') ?? 'rating'

  const [pool, setPool] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  // phase: 'loading' | 'guessing' | 'revealing' | 'wrong' | 'gameover'
  const [phase, setPhase] = useState('loading')
  const [displayedValue, setDisplayedValue] = useState(0)
  const rafRef = useRef(null)

  const loadPool = useCallback(async () => {
    setPhase('loading')
    try {
      const data = category === 'people'
        ? await getFaceoffPersons()
        : await getFaceoffMovies()
      setPool(shuffle(data))
      setIndex(0)
      setScore(0)
      setDisplayedValue(0)
      setPhase('guessing')
    } catch {
      setPhase('loading')
    }
  }, [category])

  useEffect(() => {
    loadPool()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [loadPool])

  const prevCard = index > 0 ? pool[index - 1] : null
  const leftCard = pool[index]
  const rightCard = pool[index + 1]
  const nextCard = pool[index + 2]

  function getMetricValue(card) {
    if (!card) return 0
    if (category === 'people') return card.mainRoleRating ?? 0
    return metric === 'votes' ? card.voteCount : card.tmdbRating
  }

  function animateReveal(target, onDone) {
    const duration = 1500
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 5)
      setDisplayedValue(eased * target)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        setDisplayedValue(target)
        onDone()
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function handleGuess(direction) {
    if (phase !== 'guessing') return
    const leftVal = getMetricValue(leftCard)
    const rightVal = getMetricValue(rightCard)
    const correct = rightVal === leftVal || (direction === 'higher' ? rightVal > leftVal : rightVal < leftVal)
    // Capture for use inside the async callback (stable at call time)
    const nextIndex = index + 1
    const willExhaust = nextIndex + 2 >= pool.length

    setPhase('revealing')
    animateReveal(rightVal, () => {
      if (correct) {
        setScore(s => s + 1)
        setDisplayedValue(0)
        if (willExhaust) {
          setPool(shuffle(pool))
          setIndex(0)
        } else {
          setIndex(nextIndex)
        }
        setPhase('guessing')
      } else {
        setPhase('wrong')
        setTimeout(() => setPhase('gameover'), 1000)
      }
    })
  }

  function handlePlayAgain() {
    setPool(p => shuffle(p))
    setIndex(0)
    setScore(0)
    setDisplayedValue(0)
    setPhase('guessing')
  }

  const metricWord = metric === 'votes' ? 'vote count' : 'rating'

  if (phase === 'loading') {
    return (
      <div className="fo-landing">
        <div className="fo-card-shell">
          <div className="fo-header">
            <ScaleIcon />
            <h2 className="fo-title">Face/Off</h2>
          </div>
          <div className="fo-loading">Loading...</div>
        </div>
      </div>
    )
  }

  const rightRevealed = phase === 'revealing' || phase === 'wrong' || phase === 'gameover'

  return (
    <div className="fo-landing">
      <div className="fo-card-shell">
        {/* Header */}
        <div className="fo-header">
          <ScaleIcon />
          <h2 className="fo-title">Face/Off</h2>
        </div>

        {/* Carousel — wrapper expands to fill available vertical space */}
        <div className="fo-carousel-wrapper">
        <div className="fo-carousel">
          <Card card={prevCard} size="side" revealed category={category} metric={metric} />
          <Card card={leftCard} size="active" revealed category={category} metric={metric} />
          <div className="fo-vs-col">
            <span className="fo-does-spacer" />
            <span className="fo-vs">vs.</span>
          </div>
          <Card
            card={rightCard}
            size="active"
            revealed={rightRevealed}
            displayedValue={displayedValue}
            category={category}
            metric={metric}
            isRight
          />
          <Card card={nextCard} size="side" revealed={false} category={category} metric={metric} />
        </div>
        </div>

        {/* Action row */}
        <div className="fo-action-row">
          <span className="fo-action-text">...have a</span>
          <button
            className="fo-btn fo-btn-higher"
            onClick={() => handleGuess('higher')}
            disabled={phase !== 'guessing'}
          >
            Higher
          </button>
          <span className="fo-action-text">or</span>
          <button
            className="fo-btn fo-btn-lower"
            onClick={() => handleGuess('lower')}
            disabled={phase !== 'guessing'}
          >
            Lower
          </button>
          <span className="fo-action-text">{metricWord}?</span>
        </div>

        {/* Score */}
        <div className="fo-score">Score: {score}</div>

        {/* Game over overlay */}
        {phase === 'gameover' && (
          <GameOverOverlay
            score={score}
            leftCard={leftCard}
            rightCard={rightCard}
            metric={metric}
            category={category}
            onPlayAgain={handlePlayAgain}
            onExit={() => navigate('/faceoff')}
          />
        )}
      </div>
    </div>
  )
}
