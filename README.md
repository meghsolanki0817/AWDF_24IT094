# Student Portfolio + Task Manager API (24IT094)

A modern single-page portfolio website built with **React** and **Vite** plus a **Practical 6/7 full-stack task manager** using **Express, MongoDB, Mongoose, and JWT authentication**, optimized with **Practical 8 Route-Based Lazy Loading and Performance Optimization**.

## Project Overview

- **Student Name:** Megh Solanki
- **Enrollment No.:** 24IT094
- **Branch:** Information Technology
- **College:** CSPIT, CHARUSAT
- **Portfolio Owner:** Megh Solanki
- **Technology:** React 18, Vite, React Router 7, Express, MongoDB, Mongoose, CSS

## Features

- Responsive portfolio layout with dark/light mode toggle
- Navigation bar with active link highlighting and search
- About section with student details
- Skills section with dynamic rendering using `map()`
- GitHub API integration on the Projects page with live search and retry
- Footer with contact email
- MongoDB-backed task CRUD at `/tasks`
- React task form with edit, delete, completion, loading, error, and success states
- JWT registration/login with protected task routes and `/auth/me`
- **Practical 8 Code Splitting & Performance Optimization:**
  - Route-level lazy loading (`React.lazy()` & `<Suspense>`) for all routes
  - Polished Suspense fallback spinner component (`LoadingFallback.jsx`)
  - Supplementary on-demand lazy component: `HeavyChart.jsx` and `TaskAnalytics.jsx`
  - Component memoization (`React.memo`) for `Header` and `Footer` to eliminate unnecessary re-renders
- **Practical 9 In-Memory Caching & Query Optimization:**
  - Fast server-side caching on `GET /tasks` using `node-cache` (60-second TTL)
  - Immediate cache invalidation on write operations (`POST`, `PUT`, `DELETE`) to guarantee fresh data
  - Single-task caching at `GET /tasks/:id`
  - Live cache statistics debug endpoint at `GET /cache/stats` and `POST /cache/clear`
  - In-app live cache monitor in `TaskAnalytics` UI with hit/miss counters and manual flush button

## Folder Structure

```
WEBDEV/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── docs/
│   ├── PRACTICAL_8.md             # Detailed Practical 8 benchmark report
│   └── PRACTICAL_9.md             # Detailed Practical 9 in-memory caching report
├── server/
│   ├── index.js                   # Express server with /cache debug endpoints
│   ├── cache.js                   # Practical 9 shared node-cache instance
│   ├── routes/
│   │   ├── tasks.js               # Cached GET /tasks, GET /tasks/:id, invalidations
│   │   └── auth.js
│   └── package.json               # Includes node-cache dependency
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # React.lazy() & Suspense route boundaries
│   ├── App.css
│   ├── index.css
│   ├── api.js
│   └── components/
│       ├── Header.jsx             # React.memo optimized
│       ├── NavBar.jsx             # Optimized effect listener
│       ├── Home.jsx               # Lazy-loaded route
│       ├── About.jsx              # Lazy-loaded route
│       ├── Skills.jsx             # Lazy-loaded route
│       ├── Projects.jsx           # Lazy-loaded route
│       ├── Contact.jsx            # Lazy-loaded route
│       ├── Tasks.jsx              # Lazy-loaded route
│       ├── HeavyChart.jsx         # Supplementary lazy-loaded heavy chart component
│       ├── TaskAnalytics.jsx      # Supplementary lazy-loaded component
│       ├── Auth.jsx               # Lazy-loaded route
│       ├── NotFound.jsx           # Lazy-loaded route
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
*Total initial JS payload:* **197.24 kB** (1 bundle upfront).

#### 2. After Code Splitting & Lazy Loading (`React.lazy`)
After converting routes to dynamic imports and wrapping with `<Suspense>`:
```text
dist/index.html                          0.42 kB │ gzip:  0.29 kB
dist/assets/index-DgEDZVYg.css           9.61 kB │ gzip:  2.72 kB
dist/assets/Skills-DGqTgowX.js           0.46 kB │ gzip:  0.24 kB
dist/assets/NotFound-C0-knVSu.js         0.48 kB │ gzip:  0.28 kB
dist/assets/api-DqQ-wyJN.js              0.74 kB │ gzip:  0.42 kB
dist/assets/Home-Bf1kHwC4.js             1.20 kB │ gzip:  0.55 kB
dist/assets/About-DVO3MKOg.js            1.30 kB │ gzip:  0.42 kB
dist/assets/Contact-Vz4Vf8mW.js          1.59 kB │ gzip:  0.61 kB
dist/assets/Auth-DbS9_gPM.js             1.71 kB │ gzip:  0.76 kB
dist/assets/Projects-YLtyirDF.js         2.24 kB │ gzip:  0.96 kB
dist/assets/TaskAnalytics-Cw8-qL7S.js    3.38 kB │ gzip:  1.19 kB
dist/assets/Tasks-D-FPTcW_.js            4.45 kB │ gzip:  1.69 kB
dist/assets/index-BQ8my7Q0.js          187.01 kB │ gzip: 61.96 kB
```

### Quantitative Metrics Comparison

| Metric | Before Optimization | After Optimization | Difference / Gain |
| :--- | :--- | :--- | :--- |
| **Main Bundle JS** | 197.24 kB | 187.01 kB | **-10.23 kB (-5.2%) reduction** |
| **Main Bundle (gzip)** | 64.19 kB | 61.96 kB | **-2.23 kB (-3.5%) reduction** |
| **Separate Route Chunks** | 0 (all combined) | 10 distinct chunks | Loaded purely on demand |
| **Initial JS on `/`** | 197.24 kB | 188.21 kB | Unused route code eliminated |
| **Projects chunk** | Bundled upfront | 2.24 kB | Fetched only on `/projects` |
| **Contact chunk** | Bundled upfront | 1.59 kB | Fetched only on `/contact` |
| **Tasks chunk** | Bundled upfront | 4.45 kB | Fetched only on `/tasks` |
| **Analytics chunk** | Bundled upfront | 3.38 kB | Fetched only when toggled |

### How to Test Lazy Loading with Network Throttling

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Start the preview server:
   ```bash
   npm run preview
   ```
3. Open Developer Tools (`F12`), navigate to the **Network** tab, filter by **JS**, and set Throttling to **Slow 3G**.
4. Reload the page at `http://localhost:4173/`:
   - Notice only the initial shell (`index-[hash].js`) and `Home-[hash].js` are downloaded.
5. Click on **Projects** or **Contact**:
   - The `<LoadingFallback>` spinner renders while the browser fetches `Projects-[hash].js` / `Contact-[hash].js`.
6. On the `/tasks` route, click **📊 View Task & Performance Analytics**:
   - The dedicated `TaskAnalytics-[hash].js` chunk is fetched on demand!

For comprehensive analysis, conceptual questions, and React Profiler notes, see [docs/PRACTICAL_8.md](file:///c:/Users/meghs/OneDrive/Desktop/WEBDEV/docs/PRACTICAL_8.md).

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

### Cache Verification & Debugging Endpoints

- **`GET /cache/stats`**: Inspect real-time cache hits, misses, active keys, and key/value memory sizes.
- **`POST /cache/clear`**: Manually flush all cached keys.
- **Header Inspection:** Every cached route returns `X-Cache: HIT` or `X-Cache: MISS`.
- **In-App Live Monitor:** On `/tasks`, click **"📊 View Task Analytics"** to view live cache stats and trigger real-time invalidation.

For complete theoretical answers and multi-instance scaling trade-offs, see [docs/PRACTICAL_9.md](file:///c:/Users/meghs/OneDrive/Desktop/WEBDEV/docs/PRACTICAL_9.md).

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

Open `http://localhost:5173` in your browser.
