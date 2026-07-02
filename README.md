# NovaChat

A production-ready real-time chat application built with React, TypeScript, Node.js, Express, Socket.io, and MongoDB.

## Overview

NovaChat delivers a polished, responsive, real-time messaging experience with authentication, persistent chat history, typing indicators, online/offline presence, and a premium SaaS-inspired UI.

The project is structured for clean separation of concerns, scalable state management, and straightforward deployment to Vercel and Render.

## Features

- Username-only authentication
- Real-time messaging with Socket.io
- Persistent message storage in MongoDB
- Typing indicators and online presence
- Dark mode with light mode toggle
- Responsive, premium UI with motion and polished states

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Socket.io Client
- Framer Motion
- React Hook Form + Zod

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.io
- MongoDB + Mongoose
- Helmet, CORS, compression, morgan

## Folder Structure

- frontend/src/app
- frontend/src/features
- frontend/src/shared
- backend/src/config
- backend/src/controllers
- backend/src/middleware
- backend/src/models
- backend/src/routes
- backend/src/socket
- backend/src/validators

## Installation

### Root workspace
```bash
npm install
npm run dev
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```

### Backend only
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

This project reads configuration from environment variables for both frontend and backend. Example files are provided at `frontend/.env.example` and `backend/.env.example`.

Follow these steps to prepare your environment files for local development and deployment:

1. Create the frontend `.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

2. Create the backend `.env` from the example:

```bash
cp backend/.env.example backend/.env
```

3. Edit the copied files and replace the placeholder values with your real deployment values (see the "Values to replace before deploying" section below).

Notes:
- The frontend reads `VITE_API_URL` and `VITE_SOCKET_URL`. If `VITE_API_URL` is not set, the frontend will use a relative `/api` base path so the app can work behind a proxy during development.
- The frontend dev server port can be adjusted with `FRONTEND_PORT` (defaults to `5173`).
- The backend reads `PORT`, `MONGODB_URI`, `CLIENT_URL`, and `NODE_ENV`. When `MONGODB_URI` is omitted, the server falls back to an in-memory MongoDB (for local development/testing only).
- Do NOT commit `.env` files to source control. `.gitignore` already includes `frontend/.env` and `backend/.env`.

Values to replace before deploying
---------------------------------
- `backend/.env`:
	- `PORT`: the port to run your backend (e.g. `4000`)
	- `MONGODB_URI`: your production MongoDB connection string (e.g. Atlas URI)
	- `CLIENT_URL`: the public URL where your frontend will be served (e.g. `https://your-app.example`)
	- `NODE_ENV`: `production`

- `frontend/.env`:
	- `VITE_API_URL`: full URL to the backend API (include `/api` if you prefer absolute URLs, e.g. `https://api.your-app.example/api`)
	- `VITE_SOCKET_URL`: full URL to the Socket.io server (e.g. `https://api.your-app.example`)
	- `FRONTEND_PORT` (optional): port for the dev server (local only)


## API Endpoints

- POST /api/auth/login
- POST /api/messages
- GET /api/messages
- GET /api/users/online

## Socket Events

- connection
- disconnect
- join
- send_message
- receive_message
- typing_start
- typing_stop
- user_online
- user_offline

## Deployment

### Frontend
- Deploy the Vite app to Vercel.
- Set the build command to `npm run build`.
- Set the output directory to `frontend/dist` if needed by your deployment flow.
- Configure `VITE_API_URL` and `VITE_SOCKET_URL` for the production backend URL.

### Backend
- Deploy the Express/TypeScript server to Render.
- Set the build command to `npm --workspace backend run build`.
- Set the start command to `npm --workspace backend run start`.
- Configure `MONGODB_URI`, `CLIENT_URL`, and `PORT` in the deployment environment.

## Future Improvements

- Private rooms and channels
- Message reactions and uploads
- Presence persistence and user profiles
