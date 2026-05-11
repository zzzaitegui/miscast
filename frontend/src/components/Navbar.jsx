import { NavLink } from 'react-router-dom'
import './Navbar.css'

function PersonIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  )
}

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-links">
        <span className="navbar-logo">Miscast.dev</span>
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          daily
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          custom
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          history
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          ratings
        </NavLink>
      </div>
      <NavLink to="/login" className={({ isActive }) => 'nav-profile' + (isActive ? ' active' : '')}>
        <PersonIcon />
      </NavLink>
    </nav>
  )
}
