Spec Sheet: Live Salary Stopwatch Web App
Overview

This project is a web application hosted on Vercel that allows users to calculate and view their real-time salary earnings based on their hourly wage and a stopwatch timer.

The app provides a dashboard UI where users can:

Input their hourly wage.

Start, pause, and reset a stopwatch.

See live-updated earnings calculated from elapsed time.

Optional enhancements include session tracking and projections.

Frontend (Vercel – Next.js + Tailwind + Lucide)

Framework: Next.js (React-based, Vercel native)

Styling: TailwindCSS

Icons: Lucide

UI Components:

Dashboard Page

Input field: Hourly wage ($/hr)

Button: Set Wage

Stopwatch display: HH:MM:SS

Buttons: Start / Pause / Resume / Reset

Live earnings display: $0.00

Optional Projection Section

Shows projected daily/weekly/monthly earnings based on active wage

Status Display

Current wage

Elapsed time

Total earnings

Design Guidelines

Minimal, clean UI with whitespace and responsive grid layout

Use Lucide icons (play, pause, rotate-ccw, dollar-sign)

Color palette: grayscale with accent (green/blue) for earnings

Stopwatch + earnings use large, bold font for visibility

Backend (Vercel Serverless Functions)

Language: JavaScript/TypeScript (Node.js via Vercel Serverless Functions)

Purpose: (Optional) to store wage presets and session history

Endpoints (Optional Enhancements)

POST /api/session

Input: { "wage": 25, "elapsed_seconds": 360 }

Output: { "status": "saved", "earnings": 2.50 }

Action: Save session data

GET /api/history

Input: none

Output: { "sessions": [...] }

Action: Retrieve user’s past sessions

For MVP, all logic runs client-side, backend optional.

Workflow

User Input: User enters hourly wage.

Start Timer: Stopwatch begins counting elapsed time.

Earnings Calculation:

Formula: earnings = (wage / 3600) * elapsed_seconds.

Updates every second (or every 100ms for smoother display).

User Controls:

Pause: Freezes timer.

Resume: Continues without resetting.

Reset: Clears timer and earnings.

Display Updates: Stopwatch + earnings update live in the dashboard.

Do

✅ Run stopwatch entirely in browser (client-side).

✅ Provide responsive dashboard for wage input, timer, and live earnings.

✅ Format currency properly with Intl.NumberFormat.

✅ Use React hooks (useState, useEffect) for state/timer management.

✅ Keep design modern, clean, and minimal.

✅ Optional: Allow saving sessions (localStorage or API).

What We Aren’t Doing

❌ No AI features.

❌ No scraping or external data sources.

❌ No multi-user environment (single user only).

❌ No advanced analytics dashboard.

❌ No authentication (optional future).

❌ No mobile app (desktop + responsive web only).

Rules

Read files in their entirety before editing.

Maintain a 10-item To-Do list at all times.

Mock up frontend/backend designs in Markdown files before coding.

frontend.md, backend.md, api.md, etc.

Use Research → Plan → Implement → Test flow:

Research: Review existing code, reference by file:line.

Plan: Outline specifics in task_name.md.

Implement: Build features per plan, check for redundancy.

Test: Unit tests for stopwatch logic + earnings calculation.