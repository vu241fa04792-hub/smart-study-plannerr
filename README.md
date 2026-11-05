# Smart Study Planner

**Plan Smart. Study Better. Achieve More.**

A complete, production-quality student productivity web application crafted with React, TypeScript, Tailwind CSS, Motion for React (Framer Motion), Recharts, and native IndexedDB.

---

## 🎓 Overview

Smart Study Planner is an all-in-one academic command center designed specifically for college students and learners. It balances coursework tracking, deep focus sessions, syllabus coverage, educational file management, and exam preparation in a calm, modern workspace with full Light & Dark mode support.

### Key Capabilities

- **Multi-Account Storage Isolation**: Strict account-scoped persistence (`smart_study_${userId}_*`). Create new accounts with fresh workspaces, switch demo profiles, and retain data across browser restarts.
- **Educational File Storage (IndexedDB)**: Upload and manage PDF past papers, lecture slides (PPT/PPTX), documents (DOC/DOCX), code files, and diagrams persistently in the browser's native IndexedDB without any backend server. Includes preview, download, rename, and trash management.
- **Profile Photo Upload**: Real user avatar upload and storage via native IndexedDB (`user_avatars` store) with instant preview and removal.
- **Syllabus Tracker**: Unit-by-unit syllabus checklist inside course subjects. Check off completed topics to dynamically recalculate course and overall academic progress.
- **Light & Dark Theme Engine**: Instant header toggle (Sun/Moon icons) and settings selector. Eye-friendly soft pastel light mode and high-contrast night-mode dark styling.
- **Task Management with Urgent Priority**: Full CRUD with priority levels (`urgent`, `high`, `medium`, `low`), overdue indicators, categories, tags, and status filtering.
- **Interactive Study Calendar**: Month grid and agenda views with category filters (exams, assignments, study sessions, lectures) and date-specific scheduling.
- **AI Study Plan Generator**: Synthesizes custom weekly revision schedules and allows one-click conversion directly into real Tasks and Calendar events.
- **Pomodoro Focus Timer**: Circular countdown clock with Web Audio API chime synthesis, custom durations, sessions log, and a distraction-free fullscreen focus mode.
- **Academic Performance Analytics**: Recharts visualizations for weekly study hours vs. targets, monthly productivity trends, subject distribution donut, and task status bars.
- **Notes & Cheatsheets**: Tagging, categorization, pin to top, favorite star, copy to clipboard, and distraction-free reader mode.
- **Achievements & Streaks**: 7-day consistency streak tracker, 84-day activity heatmap, progress milestones, celebratory confetti, and unlock sound effects.
- **Recently Deleted (Trash)**: Move tasks, notes, files, or calendar events to trash, restore with one click, or permanently delete with IndexedDB garbage cleanup.
- **Global Search**: Instant multi-entity lookup (tasks, subjects, notes, files) accessible via keyboard shortcut (`⌘K` or `Ctrl+K`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18+ recommended)
- npm (version 9+ recommended)

### Installation

Clone the repository and install all required dependencies:

```bash
npm install
```

### Development Startup

Run the Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:3000` to interact with the application.

### Production Build

Compile and bundle the production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔒 Scope & Architecture (Frontend-Only)

- **Frontend-Only Architecture**: This project runs entirely in the browser using React state, `localStorage` for metadata/tasks, and native `IndexedDB` for educational documents and profile photos.
- **Zero External Backend / Database**: No external servers, APIs, or cloud database credentials are required.
- **Multi-Account Scoping**: Data is strictly isolated by user ID, enabling multiple students to use the same browser without data bleed.
- **Backend-Ready Architecture**: Data structures and contexts (`src/types/index.ts`, `src/context/AppContext.tsx`) are structured with standard async CRUD signatures so that Supabase or REST services can be integrated seamlessly in the future.
