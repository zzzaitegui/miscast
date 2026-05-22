import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Faceoff.css'

const slides = Object.entries(
  import.meta.glob('../assets/faceoff-slideshow/*.webp', { eager: true })
).sort(([a], [b]) => a.localeCompare(b)).map(([, m]) => m.default)

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

function Toggle({ leftLabel, rightLabel, value, onChange }) {
  const isLeft = value === leftLabel
  return (
    <div className="faceoff-toggle-group">
      <button
        type="button"
        className={`faceoff-toggle${isLeft ? ' is-left' : ' is-right'}`}
        onClick={() => onChange(isLeft ? rightLabel : leftLabel)}
        aria-label={`Switch to ${isLeft ? rightLabel : leftLabel}`}
      >
        <span className="toggle-half">
          <span className="toggle-dot toggle-dot-a" />
        </span>
        <span className="toggle-half">
          <span className="toggle-dot toggle-dot-b" />
        </span>
      </button>
      <span className="faceoff-toggle-label">{value}</span>
    </div>
  )
}

function FaceoffSlideshow() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => {
      setActive(i => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="faceoff-card-slideshow">
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`faceoff-slide${i === active ? ' is-active' : ''}`}
        />
      ))}
    </div>
  )
}

export default function Faceoff() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('Movies')
  const [metric, setMetric] = useState('Rating')

  function play() {
    const params = new URLSearchParams({ category: category.toLowerCase() })
    if (category === 'Movies') params.set('metric', metric.toLowerCase())
    navigate(`/faceoff/play?${params}`)
  }

  return (
    <div className="faceoff-landing">
      <div className="faceoff-card" onClick={play}>
        <div className="faceoff-card-content">
          <div className="faceoff-card-header">
            <ScaleIcon />
            <h2 className="faceoff-card-title">Face/Off</h2>
          </div>
          <p className="faceoff-card-description">
            Try to guess which film or person is better rated,
            for films you may choose between ratings or popularity.
          </p>
          <div className="faceoff-toggles-area" onClick={e => e.stopPropagation()}>
            <div className="faceoff-toggles">
              <Toggle
                leftLabel="Movies"
                rightLabel="People"
                value={category}
                onChange={setCategory}
              />
              {category === 'Movies' && (
                <Toggle
                  leftLabel="Rating"
                  rightLabel="Votes"
                  value={metric}
                  onChange={setMetric}
                />
              )}
            </div>
          </div>
        </div>
        <FaceoffSlideshow />
      </div>
      <p className="faceoff-hint">Click to play...</p>
    </div>
  )
}
