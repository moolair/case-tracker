# Case Tracker

A REST API for case management built with Express.js, PostgreSQL, and Redis.

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL (via Knex.js query builder)
- **Caching:** Redis (via ioredis) with read-through cache and automatic invalidation
- **Auth:** JWT (Bearer token) with role-based access control
- **Testing:** Mocha + Chai

## Features

- **Case Management** — Create, read, update, and delete cases with status tracking (`open`, `in_progress`, `resolved`, `closed`), priority levels, and category classification
- **Notes** — Add timestamped notes to cases with author attribution
- **Authentication** — JWT-based signup/login with password hashing (bcrypt)
- **Authorization** — Role-based access: `admin`, `investigator`, `viewer`
- **Redis Caching** — Read-through caching with TTL and pattern-based invalidation on writes
- **Filtering** — Query cases by status, priority, category, or assignee

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/signup` | Register a new user | No |
| POST | `/users/login` | Login, returns JWT | No |
| GET | `/users` | List all users | Admin |

### Cases
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cases` | List cases (filterable) | User |
| GET | `/cases/:id` | Get a single case | User |
| POST | `/cases` | Create a case | User |
| PUT | `/cases/:id` | Update a case | User |
| DELETE | `/cases/:id` | Delete a case | Admin |

### Notes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cases/:caseId/notes` | List notes for a case | User |
| POST | `/cases/:caseId/notes` | Add a note to a case | User |
| PUT | `/cases/:caseId/notes/:noteId` | Update a note | User |
| DELETE | `/cases/:caseId/notes/:noteId` | Delete a note | User |

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Redis

### Setup

```bash
# Install dependencies
npm install

# Create databases
createdb case_tracker_dev
createdb case_tracker_test

# Configure environment (optional — defaults work for local dev)
cp .env.example .env

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start the server
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://localhost:5432/case_tracker_dev` | PostgreSQL connection string |
| `TEST_DATABASE_URL` | `postgresql://localhost:5432/case_tracker_test` | Test database connection string |
| `JWT_SECRET` | `default-dev-secret` | JWT signing secret |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `PORT` | `3000` | Server port |

## Scripts

```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm test               # Run tests
npm run migrate        # Run database migrations
npm run migrate:rollback  # Rollback last migration
npm run seed           # Seed sample data
```

## Project Structure

```
case-tracker/
  app.js                 # Express app setup and middleware
  authenticate.js        # JWT auth and role verification
  config.js              # Environment configuration
  knexfile.js            # Knex database config
  db/
    knex.js              # Knex instance
    redis.js             # Redis client and cache helpers
    migrations/          # Database schema migrations
    seeds/               # Seed data
  models/
    User.js              # User model (signup, login, password hashing)
    Case.js              # Case model (CRUD with filtering)
    Note.js              # Note model (per-case notes)
  routes/
    users.js             # Auth endpoints (signup, login)
    caseRouter.js        # Case CRUD endpoints
    noteRouter.js        # Note CRUD endpoints
  test/                  # Mocha + Chai API tests
```
