# Practical 8: Performance Optimization and Lazy Loading in React

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Student Name:** Megh Solanki  
**Enrollment No:** 24IT094  
**Branch:** Information Technology (CSPIT, CHARUSAT)  

---

## 1. Objective & Overview

To improve frontend application performance and initial page load speed using **code splitting** and **route-based lazy loading** with `React.lazy()` and `Suspense`.

### Core Architectural Change

#### Before Code Splitting (Monolithic Single Bundle)
All route components (`Home`, `About`, `Skills`, `Projects`, `Contact`, `Tasks`, `Auth`, `NotFound`) and their dependencies were compiled into a single JavaScript bundle transferred upfront on the first page visit:
```
Browser Request (/) ──> main.bundle.js (197.24 kB)
                         ├── [Home]
                         ├── [About]
                         ├── [Skills]
                         ├── [Projects] (GitHub API fetcher)
                         ├── [Contact] (Form handling)
                         ├── [Tasks] (Full CRUD state & API)
                         └── [Auth] (JWT login/registration)
```

#### After Code Splitting (Route-Based Dynamic Chunks)
Only the critical app shell, router, and the currently requested route are loaded initially. Remaining route components and heavy components are fetched dynamically as separate chunks only when navigated to:
```
Initial Visit (/)  ──> index-BQ8my7Q0.js (187.01 kB - Core App Shell)
                   └── Home-Bf1kHwC4.js (1.20 kB - Home Page Chunk)

Navigate to /projects ──> Projects-YLtyirDF.js (2.24 kB)
Navigate to /contact  ──> Contact-Vz4Vf8mW.js  (1.59 kB)
Navigate to /tasks    ──> Tasks-D-FPTcW_.js    (4.45 kB)
Toggle Analytics      ──> TaskAnalytics-Cw8-qL7S.js (3.38 kB)
```

---

## 2. Quantitative Bundle Size Comparison (Vite Build Output)

### Baseline (Before Optimization)
Executed `npm run build` prior to lazy loading:
```text
dist/index.html                   0.42 kB │ gzip:  0.29 kB
dist/assets/index-D-Y12iIs.css    8.25 kB │ gzip:  2.37 kB
dist/assets/index-tYaEH75S.js   197.24 kB │ gzip: 64.19 kB
✓ built in 1.32s
```
*Note: A single monolithic JS file of **197.24 kB** was downloaded by the browser regardless of which page the user wanted to view.*

### Post-Optimization (With React.lazy and Suspense)
Executed `npm run build` after implementing route-based code splitting and component lazy loading:
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
✓ built in 229ms
```

### Metrics Comparison Table

| Metric | Before Optimization | After Optimization | Impact / Delta |
| :--- | :--- | :--- | :--- |
| **Total Chunks Generated** | 1 monolithic bundle | 10 separate chunks | Clean separation of concerns |
| **Main Bundle Size (Raw)** | 197.24 kB | 187.01 kB | **-10.23 kB (-5.2%) reduction** |
| **Main Bundle Size (Gzip)** | 64.19 kB | 61.96 kB | **-2.23 kB (-3.5%) reduction** |
| **Initial JS Loaded on `/`** | 197.24 kB | 188.21 kB (`index` + `Home`) | Immediate savings upfront |
| **Projects Route Cost** | Bundled upfront | 2.24 kB (downloaded on demand) | 0 kB cost until clicked |
| **Contact Route Cost** | Bundled upfront | 1.59 kB (downloaded on demand) | 0 kB cost until clicked |
| **Tasks Route Cost** | Bundled upfront | 4.45 kB (downloaded on demand) | 0 kB cost until clicked |
| **Task Analytics Chart Cost** | Bundled upfront | 3.38 kB (downloaded on toggle) | 0 kB cost until toggled |

---

## 3. Implementation Details

### 3.1 Route-Level Code Splitting (`src/App.jsx`)
```jsx
import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingFallback from './components/LoadingFallback.jsx';

// Route imports converted to dynamic imports via React.lazy()
const Home = lazy(() => import('./components/Home.jsx'));
const About = lazy(() => import('./components/About.jsx'));
const Skills = lazy(() => import('./components/Skills.jsx'));
const Projects = lazy(() => import('./components/Projects.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));
const Tasks = lazy(() => import('./components/Tasks.jsx'));
const Auth = lazy(() => import('./components/Auth.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));

function App() {
  // App-level state (theme toggle, layout shell)
  return (
    <div className="app-shell">
      <Header name="Megh Solanki" themeColor="#2563eb" />
      <NavBar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      <main className="main-content">
        {/* Suspense fallback wraps only the Routes block */}
        <Suspense fallback={<LoadingFallback message="Loading page component..." />}>
          <Routes>
            <Route path="/" element={<Home skills={skillList} />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills skills={skillList} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer email="meghsolanki@example.com" />
    </div>
  );
}
```

### 3.2 Polished Fallback UI (`src/components/LoadingFallback.jsx`)
Provides visual feedback while the chunk is downloaded over the network:
```jsx
function LoadingFallback({ message = 'Loading component...' }) {
  return (
    <div className="loading-fallback" role="status" aria-live="polite">
      <div className="loading-spinner-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      <p className="loading-text">{message}</p>
      <span className="loading-subtext">Optimized with React.lazy() &amp; Suspense</span>
    </div>
  );
}
```

### 3.3 Component-Level Code Splitting (`src/components/TaskAnalytics.jsx`)
Satisfies the supplementary requirement to lazy-load a heavy third-party / analytical component:
```jsx
// src/components/Tasks.jsx
const TaskAnalytics = lazy(() => import('./TaskAnalytics.jsx'));

// Rendered on user interaction with dedicated Suspense boundary:
{showAnalytics && (
  <Suspense fallback={<div className="message-card">Loading Task Analytics chunk...</div>}>
    <TaskAnalytics tasks={tasks} />
  </Suspense>
)}
```

---

## 4. Key Questions & Theoretical Analysis

### Q1: What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
- **Initial Bundle (`index-[hash].js`):** Downloaded immediately when the browser first requests the HTML page. It contains the React runtime, standard router definitions, root shell layout, and critical styles necessary to render the initial entry point.
- **Lazy-Loaded Chunk (`[Component]-[hash].js`):** Downloaded asynchronously via a dynamic `import()` call only when the user performs an action that triggers rendering of that component (e.g., clicking the `/projects` link in the navbar or toggling the analytics chart). If a user never visits that route, that chunk is never transferred.

### Q2: Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
- **Reduced Time-to-Interactive (TTI) and First Contentful Paint (FCP):** The browser has to download, parse, compile, and execute less JavaScript before displaying the first view.
- **Prioritization of Critical Assets:** Users rarely visit every page of an application in a single session. By deferring non-critical routes, network bandwidth and device CPU cycles are freed up during the crucial first 2–3 seconds of page load.
- **Incremental Loading:** When navigating to a new route, the user is already engaged with the site; the browser can fetch the small chunk (1–4 kB) in milliseconds while displaying an instant fallback spinner without freezing the UI.

### Q3: In what situations would lazy loading NOT be worth the added complexity?
- **Extremely Small Applications:** In micro-apps where total bundle size is under 50–70 kB, code splitting introduces additional HTTP request overhead (TCP connection/TLS negotiation latency per chunk) that can outweigh the bundle savings.
- **Components Guaranteed to be Rendered Immediately:** Lazy loading components required on the critical path (such as the main header, navbar, or initial home view) adds unnecessary round-trip latency and potential layout shifts.
- **Unreliable / Offline Scenarios without Caching:** If a user loses connectivity after the initial load, navigating to an un-downloaded lazy route will cause a runtime network fetch error unless managed with service workers or retry boundaries.

---

## 5. React DevTools Profiler Analysis & Optimization

### Identified Unnecessary Re-renders

1. **`NavBar.jsx` Event Listener Leak on Every Render:**
   - **Issue:** In `NavBar.jsx`, `useEffect` lacked a dependency array (`[]`), causing event listeners for `auth-changed` and `auth-expired` to be removed and re-added on every single render (such as every keystroke in the search bar).
   - **Optimization:** Added `[]` as the second argument to `useEffect`, ensuring the effect runs once on mount and cleans up on unmount.

2. **Unnecessary Header & Footer Re-renders on Dark Mode / Route Change:**
   - **Issue:** When toggling theme mode in `App.jsx`, state changed at the root level, causing `Header` and `Footer` to re-render even though their props (`name`, `themeColor`, `email`) remained constant.
   - **Optimization:** Wrapped `Header` and `Footer` with `React.memo`:
     ```javascript
     export default memo(Header);
     export default memo(Footer);
     ```
   - **Result:** DevTools Profiler confirms that `Header` and `Footer` skip rendering during parent theme state re-evaluations, preserving render cycles.

---

## 6. How to Verify in Browser DevTools

1. Run the preview server:
   ```bash
   npm run build
   npm run preview
   ```
2. Open Chrome/Edge DevTools (`F12`), switch to the **Network** tab.
3. Filter by **JS**.
4. In the throttling dropdown, select **Slow 3G** or **Fast 3G**.
5. Reload the page at `http://localhost:4173/`:
   - Notice only `index-[hash].js` and `Home-[hash].js` are loaded.
6. Click on **Projects** in the navigation bar:
   - Notice the `LoadingFallback` spinner appears smoothly.
   - Observe `Projects-[hash].js` being fetched over the network and rendered.
7. Click on **Tasks** and click **📊 View Task & Performance Analytics**:
   - Observe `TaskAnalytics-[hash].js` loaded on demand!
