import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

// Films
export const getFilms = (page = 0, size = 20) =>
  api.get('/films', { params: { page, size } }).then(r => r.data)

export const getFilm = (id) =>
  api.get(`/films/${id}`).then(r => r.data)

export const searchFilms = (title) =>
  api.get('/films/search', { params: { title } }).then(r => r.data)

// Persons
export const getPerson = (id) =>
  api.get(`/persons/${id}`).then(r => r.data)

export const searchPersons = (name, role) =>
  api.get('/persons/search', { params: { name, ...(role && { role }) } }).then(r => r.data)

// Daily
export const getDaily = () =>
  api.get('/daily').then(r => r.data)

// Genres
export const getGenres = () =>
  api.get('/genres').then(r => r.data)

// Leaderboard
export const getLeaderboard = (role) =>
  api.get('/leaderboard', { params: { role } }).then(r => r.data)

// Auth
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then(r => r.data)

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data)

// Matches (protected)
export const getMatches = (token) =>
  api.get('/matches', { headers: authHeader(token) }).then(r => r.data)

export const saveMatch = (data, token) =>
  api.post('/matches', data, { headers: authHeader(token) }).then(r => r.data)
