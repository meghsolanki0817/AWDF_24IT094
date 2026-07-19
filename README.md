# Student Portfolio - Megh Solanki (24IT094)

A modern single-page portfolio website built with **React** and **Vite** for a college lab assignment.

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
- Project cards with descriptions and technology list
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

## Notes

- This project uses functional React components and props.
- The skills list is rendered dynamically via props and `map()`.
- Styling is done with custom CSS only.

## GitHub Repository Setup

If you want to initialize this as a Git repository, run:

```bash
git init
git add .
git commit -m "Initial commit: student portfolio project"
```

Then add your GitHub remote URL and push.
