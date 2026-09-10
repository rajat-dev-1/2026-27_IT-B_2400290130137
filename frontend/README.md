# CodeHealth AI — Frontend

CodeHealth AI is an explainable, repository-aware codebase-health assistant. A developer connects GitHub, selects a repository, requests an asynchronous scan, and receives a prioritized health report — complete with files at risk, technical-debt findings, and AI-assisted Architect Insights.

---

## Frontend Stack

| Tool | Role |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with token refresh interceptors |
| Lucide React | Icons |
| Sonner | Toast notifications |

---

## Project Structure

```
src/
├── app/            Router and global provider composition
├── components/
│   ├── ui/         Primitive components (Button, Card, Badge, Modal, Skeleton, States…)
│   ├── layout/     AppLayout, Sidebar, Navbar, PublicLayout
│   ├── landing/    Landing page sections
│   ├── dashboard/  Dashboard cards, ScanStatusCard
│   └── repository/ FileExplorer, FileTree, IssueList, IssueDetailModal, RecommendationPanel…
├── context/        AuthContext, RepositoryContext, ScanContext
├── hooks/          useAuth, useRepositories, useScan, useScanPolling, useRepositoryDetails
├── pages/          LandingPage, LoginPage, AuthCallbackPage, DashboardPage, RepositoryPage…
├── routes/         ProtectedRoute
├── services/       apiClient, authApi, repositoryApi, scanApi
├── styles/         globals.css (design tokens, scrollbar, focus, reduced-motion)
├── test/           setup.js (Vitest + RTL global setup)
└── utils/          cn, formatters

tests/
├── routes/         ProtectedRoute.test.jsx
├── components/     ScanStatusCard.test.jsx, IssueFilters.test.jsx
├── hooks/          useScanPolling.test.js
└── pages/          DashboardPage.test.jsx
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your local backend

# 3. Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Only one environment variable is exposed to the frontend:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the CodeHealth API, e.g. `http://localhost:5000/api` |

Do **not** add GitHub tokens, database connection strings, Redis URLs, or Groq keys here. Those belong only on the backend.

If `VITE_API_URL` is missing in development, the app logs a clear guidance message in the browser console.

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | GitHub OAuth entry point |
| `/auth/callback` | Public | OAuth return handler |
| `/dashboard` | Protected | Repository overview and scan launcher |
| `/repositories/:repoId` | Protected | Detailed repository analysis workspace |
| `/design-system` | Public | Internal component reference |
| `*` | Public | 404 Not Found |

---

## Backend Integration

The frontend communicates exclusively with the CodeHealth API. It never calls GitHub, MongoDB, Redis, BullMQ, or Groq directly.

Key API responsibilities consumed by the frontend:

| Purpose | Endpoint |
|---|---|
| GitHub OAuth login redirect | `GET /auth/github` |
| OAuth callback session | `GET /auth/github/callback` |
| Restore session | `POST /auth/refresh` |
| Current user | `GET /auth/me` |
| Logout | `POST /auth/logout` |
| List repositories | `GET /repositories` |
| Repository detail | `GET /repositories/:repoId` |
| Latest scan | `GET /repositories/:repoId/scans/latest` |
| File metrics | `GET /repositories/:repoId/files` |
| Issues | `GET /repositories/:repoId/issues` |
| Recommendations | `GET /repositories/:repoId/recommendations` |
| Queue scan | `POST /repositories/:repoId/scans` |
| Scan status | `GET /scans/:scanId` |
| Retry failed scan | `POST /scans/:scanId/retry` |

---

## Scan Lifecycle

```
User clicks Run scan
  → POST /repositories/:repoId/scans   → status: queued
  → useScanPolling polls GET /scans/:scanId every 4 seconds
  → status: running  (progress 0–100% displayed in ScanStatusCard)
  → status: completed  → toast + auto-refresh dashboard/repository report
  → status: failed     → toast + Retry scan button
```

Polling pauses when the browser tab is hidden. After 3 consecutive network failures, the scan is marked as failed with a clear recovery message.

---

## Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI in browser
```

**Covered critical paths:**

- `ProtectedRoute` — loading, authenticated, unauthenticated redirect, auth error recovery
- `ScanStatusCard` — queued ARIA, running progress, completed success, failed with retry
- `useScanPolling` — 4s interval, terminal-state stop, single completion callback, timer cleanup
- `IssueFilters` — severity/type/priority filtering, clear-all, empty result state
- `DashboardPage` — no-repositories, no-completed-scan with first-scan CTA, API error with retry

Tests use mocked API modules and never call a live API.

---

## Vercel Deployment

**Build command:** `npm run build`  
**Output directory:** `dist`

### Step 1 — Set Vercel Root Directory
When connecting this repo to Vercel, set the **Root Directory** in the Vercel project settings to `frontend`. This tells Vercel to build from `frontend/` rather than the repository root.

**Build command:** `npm run build`  
**Output directory:** `dist`

### Step 2 — Add `vercel.json`
Already present at `frontend/vercel.json`. It rewrites all paths to `index.html` so direct deep links work.

### Step 2 — Set environment variable in Vercel dashboard
```
VITE_API_URL = https://api.your-codehealth-domain.com/api
```

### Step 3 — Backend CORS
The production backend must:
- Allow the deployed Vercel domain in `Access-Control-Allow-Origin`
- Set cookies with `Secure`, `HttpOnly`, and `SameSite=None` if the frontend and backend are on different domains
- Point the GitHub OAuth callback URL to the backend, which then redirects to the frontend `/auth/callback`

Do not attempt to bypass CORS from frontend code.

### Step 4 — Post-deploy verification checklist

```
[ ] / loads without console errors
[ ] /login initiates GitHub OAuth flow
[ ] /auth/callback handles success and failure cleanly
[ ] Invalid route shows custom 404 (not Vercel's default)
[ ] /dashboard redirects unauthenticated users to /login
[ ] /repositories/:repoId redirects unauthenticated users to /login
[ ] GitHub OAuth completes and returns user to dashboard
[ ] Authenticated dashboard loads repository list
[ ] Repository workspace loads file tree, issues, and recommendations
[ ] Scan lifecycle: queue → running → complete/fail works end-to-end
[ ] Logout clears user state and returns to /
[ ] Test at 360px and 390px mobile widths
[ ] Keyboard navigation works for main flows
[ ] Escape closes modals and drawers
```

---

## MVP Scope — Intentionally Not Included

The following are out of scope for the current frontend release:

- Source-code editor or inline code modification
- GitHub issue or pull request creation
- Team, organization, or billing pages
- Settings, webhook preferences, or audit logs
- WebSockets or SSE (polling via `useScanPolling` is sufficient)
- Dark/light theme toggle
- Bull Board or queue admin interface
- AI chat assistant
- Analytics beyond the existing code-health workspace
