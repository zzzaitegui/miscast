import { useNavigate } from 'react-router-dom'
import maulCamera from '../assets/maul_camera.png'
import './Studio.css'

function FilmCameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3V10z" />
    </svg>
  )
}

export default function Studio() {
  const navigate = useNavigate()
  return (
    <div className="studio-landing">
      <div className="studio-card" onClick={() => navigate('/studio/play')}>
        <div className="studio-card-content">
          <div className="studio-card-header">
            <FilmCameraIcon />
            <h2 className="studio-card-title">Studio</h2>
          </div>
          <p className="studio-card-description">Build your own movie from scratch. No rules.</p>
        </div>
        <div className="studio-card-poster">
          <img src={maulCamera} alt="Studio" className="studio-card-poster-img" />
        </div>
      </div>
      <p className="studio-hint">Click to play...</p>
    </div>
  )
}
