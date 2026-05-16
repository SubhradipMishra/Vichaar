# Vichaar - AI-Powered Blogging Platform

A premium AI-powered blogging platform featuring creative suites, analytics, and seamless interactions.

## Project Structure

- `/Vichaar`: React + Vite frontend.
- `/server`: Node.js + Express + TypeScript backend.

## Local Setup

### Backend

1. Navigate to `server/`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Run in development: `npm run dev`
5. Build for production: `npm run build`

### Frontend

1. Navigate to `Vichaar/`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Run in development: `npm run dev`
5. Build for production: `npm run build`

## Deployment

### Backend

- Ensure `DB_URL`, `REDIS_URL`, and other environment variables are set in your hosting provider (e.g., Render, Railway, DigitalOcean).
- The server starts using `npm start` (runs `node dist/index.js`).
- Port is configurable via `PORT` environment variable.

### Frontend

- The frontend is a static site after building.
- Build using `npm run build`.
- Deploy the `dist/` folder to Netlify, Vercel, or any static hosting.
- Ensure `VITE_API_BASE_URL` points to your deployed backend API.

## Environment Variables

Check `.env.example` in both folders for the required keys.
