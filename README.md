# Student Portfolio + Task Manager API (24IT094)

A modern single-page portfolio website built with **React** and **Vite** plus a **Practical 5 backend** using **Express, MongoDB, and Mongoose**.

## Project Overview

- Student Name: Megh Solanki
- Enrollment No.: 24IT094
- Branch: Information Technology
- College: CSPIT, CHARUSAT
- Portfolio Owner: Megh Solanki
- Technology: React, Vite, JavaScript, CSS

## Features

- Responsive portfolio layout
- Navigation bar with active link highlighting
- About section with student details
- Skills section with dynamic rendering using `map()`
- GitHub API integration on the Projects page
- Loading and error states for asynchronous fetches
- Repository search and retry button in the Projects section
- Footer with contact email

## Folder Structure

```
WEBDEV/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── .gitignore
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── components/
│       ├── Header.jsx
│       ├── NavBar.jsx
│       ├── About.jsx
│       ├── Skills.jsx
│       ├── Projects.jsx
│       └── Footer.jsx
```

## How to Run

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Running Practical 5 (Backend with MongoDB)

You can run the backend in two ways: locally with a local MongoDB instance, or via Docker Compose (recommended for convenience).

Local (no Docker)

1. Install dependencies:
```powershell
cd server
npm install
```
2. Create a `.env` file in `server/` (you can copy from `.env.example`) and set `MONGO_URI`.
3. Start MongoDB locally (or use Atlas) and then run:
```powershell
npm start
```

Docker (recommended)

If you have Docker installed, run both MongoDB and the server with one command from the project root:

```powershell
docker-compose up --build
```

This starts MongoDB on port `27017` and the server on port `3000` (accessible at `http://localhost:3000`).

Frontend + Combined dev

To run the frontend (Vite) and backend concurrently during development:

```powershell
# install root deps
npm install
# install server deps
cd server
npm install
cd ..
# run both
npm run dev:all
```


## Practical 3 API Integration

- The `Projects` page now fetches repositories from GitHub using the public endpoint for `meghsolanki`.
- The page shows a loading spinner/message while the request is in progress.
- If the API call fails, an error message displays with a retry button.
- You can search repositories by name and see the repo star count and GitHub URL.

## Notes

- This project uses functional React components and props.
- The skills list is rendered dynamically via props and `map()`.
- Styling is done with custom CSS only.
- The backend uses Mongoose schema validation, enums, and MongoDB persistence.

## GitHub Repository Setup

If you want to initialize this as a Git repository, run:

```bash
git init
git add .
git commit -m "Initial commit: student portfolio project"
```

Then add your GitHub remote URL and push.
