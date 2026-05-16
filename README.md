# Palm Mind Chat App

A real-time chat application built with Node.js, Express, MongoDB, Socket.IO, React, and Tailwind CSS.

## Live Demo

[https://chatapp.adhyadeshdahal.com.np](https://chatapp.adhyadeshdahal.com.np)

## Tech Stack

**Backend** — Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, TypeScript

**Frontend** — React, TypeScript, Tailwind CSS, Socket.IO Client, Axios, Vite

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Adhyadeshdahal/ChatApp.git
cd ChatApp
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Copy .env.example to .env and fill in your values.


Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Copy .env.example to .env and fill in your values.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Login and get JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/users | Yes | Get all users |
| PATCH | /api/users/:id | Yes | Update own profile |
| DELETE | /api/users/:id | Yes | Delete own account |
| GET | /api/chat/history | Yes | Get last 100 messages |
| GET | /api/chat/stats | Yes | Get total messages and users |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| message:send | Client → Server | Send a message |
| message:new | Server → Client | New message broadcast |
| user:join | Server → Client | User joined notification |
| user:leave | Server → Client | User left notification |
| stats:online | Server → Client | Online user count update |
| stats:messages | Server → Client | Total message count update |


## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRES_IN | JWT expiry (e.g. 7d) |
| CLIENT_URL | Frontend URL for CORS |

### Frontend

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend URL |