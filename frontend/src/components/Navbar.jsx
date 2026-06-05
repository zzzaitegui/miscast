import { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function PersonIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
    </svg>
  )
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isStudioActive = location.pathname.startsWith('/studio')
  const isFaceoffActive = location.pathname.startsWith('/faceoff')

  const linksRef = useRef(null)
  const historyLinkRef = useRef(null)
  const flashTimerRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, bottom: 0 })
  const [ready, setReady] = useState(false)
  const [historyFlash, setHistoryFlash] = useState(false)
  const [flashIndicator, setFlashIndicator] = useState({ left: 0, width: 0, bottom: 0 })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const el = linksRef.current
    if (!el) return
    const active = el.querySelector('.nav-link.active')
    if (!active) return
    const cr = el.getBoundingClientRect()
    const lr = active.getBoundingClientRect()
    setIndicator({
      left: lr.left - cr.left + 2,
      width: lr.width - 4,
      bottom: cr.bottom - lr.bottom,
    })
    setReady(true)
  }, [location.pathname])

  // Clear history flash when navigating away from auth pages
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (location.pathname !== '/login' && location.pathname !== '/register') setHistoryFlash(false)
  }, [location.pathname])

  // Clean up flash timer on unmount
  useEffect(() => () => clearTimeout(flashTimerRef.current), [])

  const handleHistoryClick = useCallback((e) => {
    if (isAuthenticated) return
    e.preventDefault()
    if (historyLinkRef.current && linksRef.current) {
      const cr = linksRef.current.getBoundingClientRect()
      const lr = historyLinkRef.current.getBoundingClientRect()
      setFlashIndicator({
        left: lr.left - cr.left + 2,
        width: lr.width - 4,
        bottom: cr.bottom - lr.bottom,
      })
    }
    setHistoryFlash(true)
    clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => {
      navigate('/login', { state: { fromHistory: true } })
    }, 700)
  }, [isAuthenticated, navigate])

  function handleProfileClick() {
    if (isAuthenticated) {
      setShowLogoutConfirm(true)
    } else {
      navigate('/login')
    }
  }

  function confirmLogout() {
    setShowLogoutConfirm(false)
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-links" ref={linksRef}>
        <span className="navbar-logo">Miscast.dev</span>
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          daily
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          custom
        </NavLink>
        <NavLink to="/studio" className={() => 'nav-link' + (isStudioActive ? ' active' : '')}>
          studio
        </NavLink>
        <NavLink to="/faceoff" className={() => 'nav-link' + (isFaceoffActive ? ' active' : '')}>
          faceoff
        </NavLink>
        <NavLink
          to="/history"
          ref={historyLinkRef}
          className={({ isActive }) =>
            'nav-link' +
            (isActive ? ' active' : '') +
            (!isAuthenticated ? ' nav-link-guest' : '') +
            (historyFlash ? ' nav-link-flash' : '')
          }
          onClick={handleHistoryClick}
        >
          history
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          ratings
        </NavLink>
        <div
          className={`nav-indicator${ready ? ' ready' : ''}`}
          style={{ left: indicator.left, width: indicator.width, bottom: indicator.bottom, opacity: historyFlash ? 0 : 1 }}
        />
        {historyFlash && (
          <div
            className="nav-indicator nav-indicator-flash"
            style={{ left: flashIndicator.left, width: flashIndicator.width, bottom: flashIndicator.bottom }}
          />
        )}
      </div>
      <div className="nav-profile-wrapper">
        <button
          className={`nav-profile${isAuthenticated ? ' authenticated' : ''}`}
          onClick={handleProfileClick}
        >
          <PersonIcon />
        </button>
        {showLogoutConfirm && (
          <>
            <div className="logout-backdrop" onClick={() => setShowLogoutConfirm(false)} />
            <div className="logout-popover">
              <p className="logout-popover-title">Log out?</p>
              <div className="logout-popover-actions">
                <button className="logout-popover-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="logout-popover-confirm" onClick={confirmLogout}>Log out</button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
