# CodeHealth AI — Backend

This is Phase 2 of the CodeHealth AI Backend, establishing the core project foundation, GitHub OAuth authentication, encrypted session storage, and repository synchronization.

## Tech Stack
- **Runtime**: Node.js 20 (ES Modules)
- **API Framework**: Express
- **Database**: Neon PostgreSQL
- **Driver & ORM**: `pg` + Drizzle ORM
- **Cache**: Redis (`ioredis`)
- **Validation**: Zod
- **Logging**: Pino

## Project Structure
- `server/`: Contains the Express API source code (`src/app.js`, `src/server.js`)
- `worker/`: Contains the BullMQ worker entry point (`src/worker.js`)
- `shared/`: Constants and schemas shared between processes
- `drizzle/`: Database migrations

## Prerequisites
- Node.js 20+
- Neon PostgreSQL Project
- Redis instance

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Update `.env` with your Neon Connection URLs:
- `DATABASE_URL`: The **pooled** runtime connection string (contains `-pooler` in the hostname).
- `DATABASE_URL_DIRECT`: The **direct** connection string without pooler, used exclusively for schema migrations.

4. Create a [GitHub OAuth App](https://github.com/settings/developers):
- **Homepage URL**: `http://localhost:5173` (Frontend)
- **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback` (Backend)

5. Update `.env` with GitHub and Security credentials:
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: From your new OAuth App.
- `GITHUB_CALLBACK_URL`: Match the callback URL above.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Random 32+ byte strings for signing session tokens.
- `TOKEN_ENCRYPTION_KEY`: Exactly 32 bytes (64 hex characters) used for AES-256-GCM encryption of GitHub access tokens in the database.

## Database Migrations

Generate new migrations after changing schemas in `server/src/db/schema/`:
```bash
npm run db:generate
```

Apply migrations to your Neon database:
```bash
npm run db:migrate
```

## Running the Application

To run the API server in development:
```bash
npm run dev:server
```

To run the worker process in development:
```bash
npm run dev:worker
```

To run both concurrently:
```bash
npm run dev
```

## Health Endpoints
- `GET /health/live`: Fast liveness check.
- `GET /health/ready`: Readiness check ensuring Neon PostgreSQL and Redis connections are established.

## Authentication Flow & Tokens
The backend uses a dual-token strategy for security:
1. User clicks "Sign in with GitHub", hitting `GET /api/auth/github`.
2. Backend sets a short-lived state cookie and redirects to GitHub.
3. GitHub redirects to `GET /api/auth/github/callback`.
4. Backend exchanges the code for a GitHub token, encrypts it, and stores it in the DB.
5. Backend issues a **Refresh Token** (HTTP-only, Secure cookie) and redirects to frontend.
6. Frontend calls `POST /api/auth/refresh` to get an **Access Token** (short-lived JWT in memory).
7. Frontend includes `Authorization: Bearer <Access Token>` on subsequent requests.

### Auth Endpoints
- `GET /api/auth/github`: Start OAuth flow.
- `GET /api/auth/github/callback`: Handle OAuth callback.
- `GET /api/auth/me`: Get current authenticated user profile.
- `POST /api/auth/refresh`: Exchange valid refresh cookie for a new access token.
- `POST /api/auth/logout`: Clear refresh cookie.

### Repository Endpoints (Requires Auth)
- `GET /api/repositories`: Fetches user's repositories from GitHub, syncs them to DB, and returns the list.
- `GET /api/repositories/:repoId`: Gets details for a specific repository.

## Testing
To run the automated test suite:
```bash
npm run test:backend
```

## Phase 3: Queue and Scan Lifecycle

In this phase, we implemented a robust asynchronous queue system to handle repository scan requests without performing actual code analysis.

**Architecture:**
- **Producer (API)**: Accepts scan requests, handles rate limiting, ensures uniqueness via database constraints (`repository_id` + `commit_sha`), and enqueues jobs to BullMQ. Returns `202 Accepted`.
- **Consumer (Worker)**: A separate worker process consumes the `analyze-repository` jobs from the `repository-scan` queue. It simulates progress steps (queued → running → completed) and updates the database synchronously.
- **Idempotency**: Using PostgreSQL constraints, only one active or completed scan is allowed per unique commit SHA. Duplicate requests return the existing scan record.

**Endpoints:**
- `POST /api/repositories/:repoId/scans`: Request a new scan.
- `GET /api/scans/:scanId`: Poll scan status.
- `POST /api/scans/:scanId/retry`: Retry a failed scan securely.

**Commands to Run:**
```bash
# Terminal 1: Run the API Producer
npm run dev:server

# Terminal 2: Run the Background Worker
npm run dev:worker
```
*Note: The worker only validates queue lifecycle transitions. True static analysis is arriving in Phase 4.*

## Static Analysis (Phase 4 Preview)

### Duplication Analyzer
The Duplication Analyzer is an MVP heuristic implemented to detect likely duplicate code blocks using line-based hashing. It normalizes comments and whitespace, splits files into overlapping 5-line windows, and groups them by exact match across the repository scan. This approach is intentionally a simple heuristic and not a structural or semantic clone detector. It may occasionally group unrelated boilerplate (like repeated import blocks) or miss duplicates that differ in variable names or formatting beyond whitespace.

## Phase 7 & Deployment Readiness

CodeHealth AI is now functionally complete up to Phase 7, demonstrating a fully working local end-to-end slice (GitHub OAuth → Repository List → Run Scan → Queue → Worker → Results). 

### Deployment Checklist

To deploy to production, you will need:
1. **Neon PostgreSQL Database**: Set up production database and run `npm run db:migrate`. Use the pooled connection URL for runtime, direct URL for migrations.
2. **Upstash Redis Server**: Or equivalent. Required for BullMQ job queues. Ensure `REDIS_URL` uses TLS (`rediss://`).
3. **GitHub OAuth App**: Create a production OAuth app with the production frontend URL and backend callback URL.
4. **Groq API Key**: (Phase 4 integration) Get a valid API key from Groq console.
5. **Node.js Environment**: Node 20+. You must run *both* the API server (`node server/src/server.js`) and the background worker (`node worker/src/worker.js`) concurrently or as separate services on platforms like Render, Heroku, or Fly.io.

**Security Requirements for Production:**
- `NODE_ENV=production` must be set.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `TOKEN_ENCRYPTION_KEY` must be strong, randomly generated secrets (min 32 bytes). Keep them out of version control.
- `COOKIE_SECURE=true` should be enabled to enforce HTTPS-only cookies (requires HTTPS in production).

**Environment Variables Summary (.env):**
- `PORT`
- `CLIENT_URL`
- `LOG_LEVEL` (use `info` for production)
- `DATABASE_URL` / `DATABASE_URL_DIRECT`
- `REDIS_URL`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_CALLBACK_URL`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `TOKEN_ENCRYPTION_KEY`
- `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL`
- `COOKIE_SECURE` / `COOKIE_SAME_SITE`
- `GROQ_API_KEY` / `GROQ_MODEL`
- `SCAN_MAX_FILE_SIZE_BYTES` / `SCAN_MAX_FILES_PER_REPO`

### Automated Testing

Run the full test suite with:
```bash
npm test
```

Or run targeted suites:
```bash
npm run test:unit        # Unit tests only
npm run test:integration # API + worker integration tests
npm run test:coverage    # Generate coverage report
```
