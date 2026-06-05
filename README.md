# Miscast

A film rating game built on top of TMDB data. You're shown a real film with its cast and crew. Swap people in or out of the roster and a predicted rating updates in real time based on each person's historical track record in that role. Depending on the mode, you're trying to hit a target rating in as few swaps as possible, comparing films and people, or just exploring.

---

## Game Modes

**Daily Challenge** - A new film and target rating every day, the same for all players. You have 10 swaps to meet the target. The direction (raise or lower the rating) depends on the film chosen for that day.

**Custom** - Pick any film from the database and swap freely, no target and no swap limit. Useful for experimenting with how different casting choices theoretically affect a film's score.

**Studio** - Build a fictional film from scratch. Start with empty slots for each role, fill them with real people from the database, and optionally upload a custom poster and title. No win condition, just see what rating your choices generate.

**Face/Off** - Higher or Lower with movies or people. Two cards are shown side by side: the left card's metric is revealed, the right card's is hidden. Guess whether the hidden value is higher or lower. A correct guess chains, the right card becomes the new left, a new card slides in. First wrong guess ends the game. Score is how many rounds you survived.

---

## Tech Stack

- **Frontend**: React (Vite), React Router, plain CSS, no UI component libraries
- **Backend**: Spring Boot 4.x, Spring Data JPA, Spring Security with JWT
- **Database**: PostgreSQL 16
- **Data source**: TMDB API (films, credits, ratings)
- **Deployment**: Docker Compose, three containers (db, backend, frontend via Nginx)

---

## Technical

### Project Structure

```
miscast/
├── backend/
│   └── src/main/java/com/miscast/backend/
│       ├── controller/       REST endpoints
│       ├── entity/           JPA entities (Film, Person, FilmPerson, Match, ...)
│       ├── repository/       Spring Data repositories
│       ├── service/          DataLoader, rating runners, TMDB client, daily challenge
│       ├── security/         JWT filter and config
│       └── dto/              Request/response shapes
├── frontend/
│   └── src/
│       ├── pages/            One component per route
│       ├── components/       Navbar, SwapModal
│       ├── services/         Axios API layer
│       └── context/          Auth context (JWT storage)
├── docker-compose.yml
├── .env                      See .env.example
└── .env.example
```

### Data Pipeline

Films and people are loaded from TMDB at startup by `DataLoader.java`, which implements Spring Boot's `CommandLineRunner`. It runs after the HTTP server starts and is fully idempotent, it checks `filmRepository.count() > 0` on boot and skips everything if data already exists, so restarts are instant.

**Films**: fetched from TMDB's discover endpoint filtered to 1995-2025 with at least 3,000 votes, sorted by popularity. Films with no director credit or no poster are excluded. Dataset: ~1,500-2,000 films covering recognisable titles from the last 30 years.

**People**: for each unique person across all loaded films, their full `movie_credits` are fetched from TMDB. Credits are filtered to the five roles the game uses (director, actor, writer, DoP, composer) and a per-role rating is computed and stored on the Person entity. This is the slow part of the initial load.

### Rating Algorithms

#### Film adjusted rating

Raw TMDB ratings (0-10) are passed through a tanh curve to create more spread between average and exceptional films:

```
adjustedRating = tmdbRating + a · tanh(b · (tmdbRating − c))
```

Parameters (configurable in `application.properties`): center `c = 7.0`, amplitude `a = 3.0`, steepness `b = 0.1`. The effect is that films rated above 7 get pushed higher and films below 7 get pushed lower, which makes swaps feel more meaningful, there's a bigger visible difference between swapping in a great director on a mediocre film vs. an already-great one.

#### Person ratings (per role)

Each person gets up to five separate ratings, one per role. Computed with a Bayesian weighted average that shrinks toward the global TMDB mean (6.5) when someone has few credits, avoiding large swings from a single lucky or unlucky film:

```
roleRating = (C · m + Σ(vote_average · vote_count)) / (C + Σ vote_count)
```

Where `m = 6.5` (global mean) and `C = 1000` (prior weight). A person needs at least 3 qualifying credits (each with `vote_count > 50`) in a role to receive a valid rating for that role. Below that threshold the rating is stored as null, and they contribute zero delta when swapped in-game.

#### In-game predicted rating

The predicted rating updates live on every swap. It's anchored to the film's adjusted rating, with each swap adding or subtracting a delta based on who was replaced and who replaced them:

```
predictedRating = clamp(filmBase + Σ(weight[role] × (newRating − oldRating) × 0.04), 1, 10)
```

Role weights: director = 10, writer = 5, actor = 3, DoP = 2, composer = 1. The 0.04 scale factor keeps individual swaps from dominating, swapping a top-rated director typically moves the predicted rating by 0.5-1.5 points. Persons with a null rating use 6.5 as fallback, contributing zero delta.

### Deployment

Three containers managed by Docker Compose:

| Container | Image | Role |
|---|---|---|
| `db` | postgres:16 | Stores all game and user data |
| `backend` | eclipse-temurin:21-jre | Spring Boot API |
| `frontend` | nginx:alpine | Serves the React app, proxies `/api` to backend |

The backend depends on the database being healthy before starting. The frontend depends on the backend being healthy (Spring Boot up and serving) before Nginx starts. The browser only ever talks to port 80, Nginx forwards `/api/*` requests to the backend internally.

**First boot** takes time because the DataLoader fetches film and person data from TMDB. The app is accessible at `http://localhost` while this runs, but most game endpoints return empty results until it finishes. Subsequent starts skip the DataLoader entirely.

| Time | What's happening |
|---|---|
| 0-90s | Spring Boot starts, HTTP server up, DB schema created |
| ~90s | Backend healthcheck passes (`/api/films` → 200 OK) |
| ~90s | Nginx starts, app is live at `http://localhost` |
| 90s - ~20min | DataLoader running in background, game data loading |
| ~20min+ | DataLoader done, app fully functional |

### Running locally without Docker

Requirements: Java 21, Node 22, PostgreSQL 16, a TMDB API key.

```bash
# 1. Set up environment
cp .env.example .env
# fill in .env with your values

# 2. Start the backend
cd backend
mvn spring-boot:run

# 3. Start the frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to `localhost:8080` automatically.

### Environment variables

| Variable | Description |
|---|---|
| `TMDB_API_KEY` | TMDB API v3 read access key |
| `MISCAST_JWT_SECRET` | Secret used to sign JWTs, minimum 32 characters |
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |

Copy `.env.example` to `.env` and fill in the values. The `.env` file is gitignored and never committed.
