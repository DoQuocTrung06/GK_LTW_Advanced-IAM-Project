# Note
- Since Docker is required, there will be a delay on first connection
- Wait 30s before timeout
- Wait 10s for pong response
- Wait 10s when unavailable
- Real-time collaborative drawing between accounts may be slightly laggy on first connection

# Magic Whiteboard
A real-time collaborative whiteboard application built with React, Laravel and WebSockets.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Laravel (PHP)
- **WebSocket:** Laravel Reverb
- **Database:** MySQL
- **Containerization:** Docker + Docker Compose

## Requirements
- Docker Desktop installed and running
- No XAMPP or Node.js required

## Setup & Run

### 1. Clone repository
git clone https://github.com/DoQuocTrung06/GK_LTW_Advanced-IAM-Project
cd Advanced-IAM-Project

### 2. Start the application
docker-compose up --build

### 3. Wait for all services to be ready
You should see all 4 lines below:
- `whiteboard_db` → Healthy
- `whiteboard_reverb` → Starting server on 0.0.0.0:8080
- `whiteboard_backend` → Server running on http://0.0.0.0:8000
- `whiteboard_frontend` → VITE ready

### 4. Open browser
http://localhost:5173

## Test Accounts
- Register a new account via Sign Up, enter your details and verify with a 6-digit OTP sent to your email
- Login with Google OAuth
- Login with GitHub OAuth

## Features
- Google & GitHub OAuth login
- Two-Factor Authentication (2FA)
- Real-time collaborative drawing (WebSocket)
- Role-based access control (Owner / Editor / Viewer)
- Board sharing via email invitation
- Auto-save board data

## Stop the application
Press Ctrl+C in terminal, then run:
docker-compose down
