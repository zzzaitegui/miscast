import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMatches } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getRatingColor, getVoteCountColor } from '../utils/ratingColor'
import './History.css'

function HistoryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function RatingCircle({ value, label }) {
  const color = getRatingColor(value)
  return (
    <div className="history-circle-wrapper">
      <div className="history-circle" style={{ background: color }}>
        <span className="history-circle-value">{value?.toFixed(1)}</span>
      </div>
      <span className="history-circle-label">{label}</span>
    </div>
  )
}

function FaceoffBadge({ value, metric, label }) {
  const color = metric === 'votes' ? getVoteCountColor(value) : getRatingColor(value)
  const display = metric === 'votes'
    ? Math.round(value).toLocaleString()
    : Number(value).toFixed(1)
  return (
    <div className="history-circle-wrapper">
      <div className="history-fo-badge" style={{ background: color }}>
        <span className="history-fo-badge-value">{display}</span>
      </div>
      <span className="history-circle-label">{label}</span>
    </div>
  )
}

function formatDate(isoString) {
  const d = new Date(isoString)
  const now = new Date()
  const opts = { month: 'short', day: 'numeric' }
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('en-US', opts)
}

function HistoryRow({ match }) {
  const navigate = useNavigate()
  const isDaily = match.mode === 'daily'

  return (
    <div className="history-row" onClick={() => navigate(`/game/${match.filmId}`)}>
      <div className="row-film">
        <p className="row-title">{match.filmTitle} ({match.filmYear})</p>
        <div className="row-tags">
          <span className="row-mode">{isDaily ? 'Daily' : 'Custom'}</span>
          {isDaily && (
            <span className={`row-result ${match.won ? 'win' : 'loss'}`}>
              {match.won ? 'Win' : 'Loss'}
            </span>
          )}
          <span className="row-swaps">{match.swapsUsed} swap{match.swapsUsed !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="row-ratings">
        <RatingCircle value={match.filmBaseRating} label="Base" />
        <RatingCircle value={match.finalRating} label="Final" />
        {isDaily && match.targetRating != null && (
          <RatingCircle value={match.targetRating} label="Target" />
        )}
      </div>

      <span className="row-date">{formatDate(match.completedAt)}</span>
    </div>
  )
}

function FaceoffRow({ match }) {
  const metricIsVotes = match.faceoffMetric === 'votes'
  const leftLabel = match.faceoffLeftLabel ?? '—'
  const rightLabel = match.faceoffRightLabel ?? '—'

  return (
    <div className="history-row history-row-no-click">
      <div className="row-film">
        <p className="row-title">{leftLabel} vs {rightLabel}</p>
        <div className="row-tags">
          <span className="row-mode">Face/Off</span>
          {match.won && <span className="row-result record">Record</span>}
          <span className="row-swaps">{match.swapsUsed} pt{match.swapsUsed !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="row-ratings">
        {match.targetRating != null && (
          <FaceoffBadge
            value={match.targetRating}
            metric={metricIsVotes ? 'votes' : 'rating'}
            label={leftLabel.length > 14 ? leftLabel.slice(0, 13) + '…' : leftLabel}
          />
        )}
        {match.finalRating != null && (
          <FaceoffBadge
            value={match.finalRating}
            metric={metricIsVotes ? 'votes' : 'rating'}
            label={rightLabel.length > 14 ? rightLabel.slice(0, 13) + '…' : rightLabel}
          />
        )}
      </div>

      <span className="row-date">{formatDate(match.completedAt)}</span>
    </div>
  )
}

export default function History() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    getMatches(token)
      .then(data => { setMatches(data); setError(false) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="history-page">
      <div className="history-card">
        <div className="history-card-header">
          <HistoryIcon />
          <h1 className="history-card-title">History</h1>
        </div>

        {loading ? (
          <div className="history-state">Loading...</div>
        ) : error ? (
          <div className="history-state">Could not load history.</div>
        ) : matches.length === 0 ? (
          <div className="history-state">
            <p>No matches yet.</p>
            <p className="history-state-sub">Play a daily or custom game to see your history here.</p>
          </div>
        ) : (
          <div className="history-list">
            {matches.map((match) =>
              match.mode === 'faceoff'
                ? <FaceoffRow key={match.id} match={match} />
                : <HistoryRow key={match.id} match={match} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
