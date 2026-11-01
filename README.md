# Student Portfolio + Task Manager (24IT094)

[![CI Pipeline](https://github.com/meghsolanki0817/AWDF_24IT094/actions/workflows/ci.yml/badge.svg)](https://github.com/meghsolanki0817/AWDF_24IT094/actions/workflows/ci.yml)

A modern full-stack web application built with **React, Vite, Node.js, Express, MongoDB, Docker, and GitHub Actions**, featuring a personal developer portfolio, full-stack task manager, intelligent AI task assistance, in-memory caching, and asynchronous event processing.

## Project Overview

- **Student Name:** Megh Solanki
- **Enrollment No.:** 24IT094
- **Branch:** Information Technology
- **College:** CSPIT, CHARUSAT
- **Portfolio Owner:** Megh Solanki
- **Technology Stack:** React 18, Vite, Node.js, Express, MongoDB, Mongoose, Jest, Supertest, Docker, GitHub Actions, OpenAI API, Gemini API, CSS3

## Features

- **Personal Portfolio:** Responsive developer portfolio with modern dark/light mode theme toggle.
- **Dynamic Skills & About:** Interactive skills rendered dynamically with `map()` and about section.
- **GitHub Integration:** Projects page integrating GitHub Public REST API with live search and retry mechanisms.
- **Full-Stack Task Manager:** MongoDB-backed task CRUD with optimistic React UI updates and instant in-memory fallback.
- **AI-Powered Task Assistant:** One-click task description generator using server-side OpenAI/Gemini with resilient graceful degradation, suggested priority levels, estimated deadlines, and mandatory AI disclaimer.
- **In-Memory Caching (Practical 9):** High-speed server caching with `node-cache` (60s TTL), automatic write invalidation, and live debug stats.
- **Event-Driven Processing (Practical 10):** Decoupled asynchronous background processing using Node.js native `EventEmitter` and Server-Sent Events (SSE) job monitoring console.
- **Performance Optimization (Practical 8):** Route-based dynamic code-splitting with `React.lazy()` and `<Suspense>`, on-demand heavy components (`HeavyChart.jsx`, `TaskAnalytics.jsx`), and `React.memo` memoization.
- **Automated CI/CD Pipeline:** GitHub Actions workflow running automated Jest & Supertest API tests on every push and pull request to `main`.
- **Containerization Support:** Production-ready `Dockerfile` and `docker-compose.yml` for multi-container full-stack deployment.

## Folder Structure

```
WEBDEV/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions automated CI/CD workflow
├── docker-compose.yml             # Multi-container Docker deployment configuration
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── docs/
│   ├── PRACTICAL_8.md             # Practical 8 Performance Optimization report
│   ├── PRACTICAL_9.md             # Practical 9 In-Memory Caching report
│   └── PRACTICAL_10.md            # Practical 10 EventEmitter architecture report
├── server/
│   ├── Dockerfile                 # Node.js 18 Alpine production container image
│   ├── index.js                   # Express server startup and router mounting
│   ├── events.js                  # TaskEvents extending Node.js native EventEmitter
│   ├── listeners.js               # Asynchronous event listeners (task-created, task-deleted, error)
│   ├── demo-events.js             # Event execution console verification script
│   ├── cache.js                   # Shared node-cache instance with TTL configuration
│   ├── tests/
│   │   └── tasks.test.js          # Jest & Supertest automated API tests
│   ├── routes/
│   │   ├── tasks.js               # Task CRUD with node-cache caching
│   │   ├── ai.js                  # AI assistant with graceful fallback & rate limiter
│   │   ├── jobs.js                # Event-driven background jobs & SSE stream
│   │   └── auth.js
│   └── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # React.lazy() & Suspense route boundaries
│   ├── App.css                    # Design system and component styling
│   ├── index.css
│   ├── api.js                     # Unified API client functions
│   └── components/
│       ├── Header.jsx             # React.memo optimized
│       ├── NavBar.jsx             # Active route listener & theme toggle
│       ├── Home.jsx               # Primary entry and overview hub
│       ├── About.jsx              # Student introduction
│       ├── Skills.jsx             # Dynamic technical skills
│       ├── Projects.jsx           # Featured and GitHub showcase projects
│       ├── Contact.jsx            # Contact details
│       ├── Tasks.jsx              # Task manager board with CRUD & AI assistant
│       ├── HeavyChart.jsx         # Supplementary lazy-loaded heavy chart component
│       ├── TaskAnalytics.jsx      # Supplementary lazy-loaded component
│       ├── AsyncJobs.jsx          # Event-driven asynchronous processing console
│       ├── NotFound.jsx           # 404 fallback page
│       ├── LoadingFallback.jsx    # Custom Suspense spinner UI
│       └── Footer.jsx             # React.memo optimized
```

---

## Practical 8: Performance Optimization & Lazy Loading

### Before vs. After Optimization (Vite Build Analysis)

#### 1. Baseline (Single Monolithic Bundle)
Before optimization, all route components were statically imported:
```text
dist/index.html                   0.42 kB │ gzip:  0.29 kB
dist/assets/index-D-Y12iIs.css    8.25 kB │ gzip:  2.37 kB
dist/assets/index-tYaEH75S.js   197.24 kB │ gzip: 64.19 kB
```
*Total initial JS payload:* **197.24 kB** (1 monolithic bundle upfront).

#### 2. After Code Splitting & Lazy Loading (`React.lazy`)
After converting routes to dynamic imports and wrapping with `<Suspense>`:
```text
dist/index.html                          0.42 kB │ gzip:  0.29 kB
dist/assets/index-BH_MQHQU.css          11.53 kB │ gzip:  3.17 kB
dist/assets/Skills-BPPbu7In.js           0.46 kB │ gzip:  0.24 kB
dist/assets/NotFound-KCISAHoF.js         0.48 kB │ gzip:  0.28 kB
dist/assets/api-62xK8HnK.js              1.11 kB │ gzip:  0.57 kB
dist/assets/Home-D7rCH6MM.js             1.20 kB │ gzip:  0.55 kB
dist/assets/About-C8qPf2Oq.js            1.30 kB │ gzip:  0.42 kB
dist/assets/Contact-Bs6z5stS.js          1.59 kB │ gzip:  0.61 kB
dist/assets/HeavyChart-Cr5uHPxS.js       3.00 kB │ gzip:  1.25 kB
dist/assets/TaskAnalytics-GpTiyW70.js    6.96 kB │ gzip:  2.00 kB
dist/assets/Tasks-BsU77Vyu.js            7.28 kB │ gzip:  2.52 kB
dist/assets/Projects-fAg_rRTw.js         8.02 kB │ gzip:  3.08 kB
dist/assets/AsyncJobs-Gk8TfFMb.js       16.13 kB │ gzip:  4.45 kB
dist/assets/index-BokPbhn_.js          186.55 kB │ gzip: 61.85 kB
```

For complete analysis, see [docs/PRACTICAL_8.md](file:///c:/Users/meghs/OneDrive/Desktop/WEBDEV/docs/PRACTICAL_8.md).

---

## Practical 9: In-Memory Caching & Query Optimization

Implemented server-side in-memory caching using `node-cache` (60s TTL) for `GET /tasks` and `GET /tasks/:id`, with automatic cache invalidation on `POST`, `PUT`, and `DELETE`.

### Measured Response Time Comparison (Empirical Benchmark)

| Sample # | Uncached Latency (`X-Cache: MISS`) | Cached Latency (`X-Cache: HIT`) | Gain / Reduction |
| :---: | :---: | :---: | :---: |
| **Sample 1** | 4.18 ms | 2.48 ms | **40.6% faster** |
| **Sample 2** | 2.56 ms | 2.60 ms | Direct memory read |
| **Sample 3** | 2.92 ms | 2.68 ms | 8.2% faster |
| **Sample 4** | 2.83 ms | 2.64 ms | 6.7% faster |
| **Sample 5** | 2.90 ms | 2.15 ms | **25.8% faster** |
| **Average** | **3.08 ms** | **2.51 ms** | **18.5% average latency reduction** |

For complete analysis, see [docs/PRACTICAL_9.md](file:///c:/Users/meghs/OneDrive/Desktop/WEBDEV/docs/PRACTICAL_9.md).

---

## Practical 10: Event-Driven Architecture with Native EventEmitter

Decoupled background tasks using Node.js built-in `EventEmitter`:
- Non-blocking 2-second simulated email/webhook dispatch
- API responds immediately (`HTTP 201`) before listeners execute
- `task-created`, `task-deleted`, and `error` listeners registered in `server/listeners.js`
- Interactive SSE-powered background job stream at `/jobs`

For complete analysis, see [docs/PRACTICAL_10.md](file:///c:/Users/meghs/OneDrive/Desktop/WEBDEV/docs/PRACTICAL_10.md).

---

## Automated CI/CD Pipeline & API Testing

Configured via `.github/workflows/ci.yml` that runs on every push and pull request to `main`:
- Runs automated tests covering task CRUD, in-memory caching, event logging, request validation, and AI endpoints
- Immediate pass/fail reporting and live status badge

Run tests locally:
```bash
npm test
```

---

## AI-Powered Task Assistant

- **Endpoint:** `POST /api/ai/generate-description`
- **Graceful Degradation:** Automatic smart template generation if external API is offline or unconfigured
- **Interactive UI:** Click **"✨ Generate description with AI"** on `/tasks` to auto-fill description, suggested priority, and deadline
- **Rate Limiting:** 10-second client cooldown countdown & backend IP rate limiting
- **Responsible AI:** Transparent disclaimer banner emphasizing human review before saving

---

## Docker Containerization

Run the full stack (Node backend + MongoDB database) in isolated containers:
```bash
docker compose up -d --build
```

---

## How to Run the App

### Frontend Development
```bash
npm install
npm run dev
```

### Full-Stack (Frontend + Backend)
```bash
npm run dev:all
```

### Run Automated Tests
```bash
npm test
```

Open `http://localhost:5173` in your browser.
