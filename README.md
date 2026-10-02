# Lead Desk

Lead Desk is a small full-stack app where users log in and manage sales leads. There are two roles: **members** see and create only their own leads, and **admins** see every lead (with its owner) plus the list of users. The focus is secure authentication done properly on both sides: JWT access and refresh tokens in httpOnly cookies, refresh-token rotation with revocation, silent single-flight token refresh on the frontend, and role checks enforced on the backend. The whole thing runs with one Docker Compose command.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js 22, Express 5, TypeScript |
| Database | PostgreSQL 16, TypeORM (entities, migrations + repositories) |
| Validation | Zod |
| Auth | `jsonwebtoken` (access JWT), random opaque refresh token (SHA-256 hashed in DB), `bcryptjs` |
| Backend tests | Vitest + Supertest (against the Compose Postgres) |
| Frontend | React 18, Vite, TypeScript, React Router 6, Axios, Tailwind CSS Play CDN, daisyUI CDN |
| Serving | Nginx (unprivileged) serves the built frontend and proxies `/api` to the backend |

## Prerequisites

Docker and Docker Compose. Nothing else (no Node.js or PostgreSQL on the host).

## How to run

```bash
cp .env.example .env
docker compose up --build
```

The first start takes a minute: the backend waits for the database to be healthy, runs migrations, runs the seed, then starts the API.

## URLs and seed logins

| What | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api (also available through the frontend at http://localhost:3000/api) |
| Health check | http://localhost:3001/api/health |

| Email | Password | Role | Lands on |
|---|---|---|---|
| `admin@leaddesk.test` | `Admin@123` | admin | `/admin` |
| `member@leaddesk.test` | `Member@123` | member | `/dashboard` |

Each user is seeded with 4 sample leads. The seed is idempotent, so restarting does not duplicate data.

To reset everything (including the database volume): `docker compose down -v`.

### Testing the token refresh

Set `ACCESS_TOKEN_TTL_MINUTES=1` in `.env`, then run `docker compose up -d`. Log in, wait over a minute, and click around or reload `/admin`. In the browser's Network tab you will see one `401`, one `POST /api/auth/refresh`, then the original request retried successfully. When several requests fail at once, only one refresh call is made.

## Running the tests

```bash
docker compose run --rm backend npm test
```

This starts the database (if needed), applies migrations and the seed, then runs the tests: login and cookies, refresh rotation and reuse rejection, admin-only access (403 vs 200), and member lead scoping.

## Environment variables

Defined in `.env` (copy from `.env.example`). Never commit `.env`.

| Variable | Description |
|---|---|
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `JWT_SECRET` | Secret used to sign access tokens. Use a long random value (`openssl rand -base64 48`) |
| `ACCESS_TOKEN_TTL_MINUTES` | Access token and access cookie lifetime (default 15) |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh token and refresh cookie lifetime (default 7) |
| `COOKIE_SECURE` | `false` for local http, `true` in production (https) |
| `BACKEND_PORT` | Host port for the backend (default 3001) |
| `FRONTEND_PORT` | Host port for the frontend (default 3000) |

`DATABASE_URL` and `PORT` are set for the backend by `docker-compose.yml`.

## API endpoints

All endpoints use the `/api` prefix. Errors always use the shape `{ "error": "message" }` (validation errors add a `details` array).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Validates credentials, sets httpOnly access and refresh cookies, returns the user |
| POST | `/api/auth/refresh` | Refresh cookie | Rotates the refresh token and issues a new access token. The old refresh token is rejected afterwards |
| POST | `/api/auth/logout` | Refresh cookie | Revokes the refresh token and clears both cookies (works even if the access token has expired) |
| GET | `/api/auth/me` | Logged in | Returns the current user and role |
| GET | `/api/leads` | Logged in | Member: own leads. Admin: all leads with `owner_name` |
| POST | `/api/leads` | Logged in | Creates a lead owned by the current user (validated) |
| GET | `/api/admin/users` | Admin only | Lists users (never password hashes). Members get 403 |
| GET | `/api/health` | Public | 200 when the service and database are up |

Status codes: `401` not logged in or token expired/invalid, `403` wrong role, `422` invalid input (`400` for malformed JSON).

## Screenshots

<!-- Add screenshots to docs/ and uncomment:
![Login](docs/login.png)
![Member dashboard](docs/dashboard.png)
![Admin page](docs/admin.png)
-->

## Assumptions

- Postgres is not published to the host. Only the backend needs it, over the Compose network.
- The API is also exposed on port 3001 for convenience (health checks, curl). The frontend itself uses the same-origin `/api` proxy.
- The backend tests use the same Compose database as the app. They only add data and do not depend on a clean database.
- Lead status is set by the creator at creation time. There is no edit or delete in this version.

## Explanation

### 1. Auth flow
Login validates the body with Zod, checks the bcrypt hash, and sets two httpOnly, SameSite=Lax cookies: a 15-minute JWT access token (path `/`) and a random 7-day refresh token (path `/api/auth`). Only the SHA-256 hash of the refresh token is stored. When the access token expires, the API returns 401 and the frontend calls `/auth/refresh`. That call atomically revokes the presented token and issues a fresh pair (rotation). Replaying an already-used refresh token returns 401 and revokes all of that user's active refresh tokens. Logout revokes the refresh token on the server and clears both cookies, and works even with an expired access token.

### 2. Refresh handling
Every request goes through one Axios instance. A response interceptor catches 401s, and a module-level `refreshPromise` holds the refresh in flight. Concurrent failures all await that same promise, so only one `/auth/refresh` call is made. Each failed request then retries once (guarded by a `_retry` flag). Login, refresh and logout are excluded to avoid loops. If the refresh fails, an auth-failure handler clears the user state and the route guards redirect to `/login`. The frontend never touches tokens: no localStorage, sessionStorage or JS-readable cookies.

### 3. Role-based access
On the backend, `requireAuth` verifies the JWT cookie (401), and `requireRole('admin')` (403) protects the whole `/api/admin` router. `/api/leads` filters by the `owner_id` from the verified token, never from client input. On the frontend, `RequireAuth` waits for the `/auth/me` session restore, sends logged-out users to `/login` (remembering the page they wanted), and sends users with the wrong role to `/forbidden`. `GuestOnly` bounces logged-in users away from `/login`. Frontend checks are only for user experience; the backend is what enforces access.

### 4. Docker setup
`db` has a `pg_isready` healthcheck. `backend` waits for `service_healthy`, runs migrations and the idempotent seed, then starts the API with its own healthcheck on `/api/health`. `frontend` waits for the backend to be healthy. Base images are pinned. The backend runs as `USER node`, and the frontend uses `nginx-unprivileged` (non-root, port 8080). Dependency files are copied and installed before the source for layer caching.

### 5. Decisions and trade-offs
Express with TypeScript, TypeORM entities and migrations, Zod for validation, and bcryptjs because it is pure JavaScript (no native build on Alpine). I put Nginx in front so the app runs on one origin: no CORS configuration, and cookies are first-party. With more time I would use a separate test database and a multi-stage backend image, so dev dependencies and tests are not in the runtime image.

### 6. What is not finished
No frontend tests, no rate limiting on login, no pagination, search or admin lead edit/delete, and no CI workflow. Expired and revoked refresh-token rows are never cleaned up. There is no CSRF token; protection relies on SameSite=Lax cookies and JSON-only endpoints.

### 7. AI tools
I used GitHub Copilot in VS Code for implementation assistance, code review and troubleshooting. I ran and tested the changes, reviewed the resulting code, and can explain the implementation.
