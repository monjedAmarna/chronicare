# Chronicare Backend

This is the backend API for the Chronicare Health platform.

## Features
- Modular Express.js structure (controllers, routes, services, models, middlewares)
- Environment config via `.env`
- Ready for REST API development
- Node.js 22.x compatible
- **Dockerized MySQL + phpMyAdmin + backend dev environment**

## Getting Started

### 1. Install dependencies (for local dev)
```bash
cd backend
npm install
```

### 2. Environment setup
- Copy `.env.example` to `.env` and fill in your values.
- For Docker, use the following recommended variables in `/backend/.env`:
  ```env
  DB_HOST=db
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=secret
  DB_NAME=chronicare
  PORT=4000
  CORS_ORIGIN=http://localhost:5173
  NODE_ENV=development
  JWT_SECRET=your_super_secret_key
  ```

### 3. Run with Docker Compose (recommended for full stack)
```bash
docker-compose up --build
```
- MySQL: `localhost:3306` (internal: `db:3306`)
- phpMyAdmin: [http://localhost:8080](http://localhost:8080) (user: root, pass: secret)
- Backend API: [http://localhost:4000](http://localhost:4000)

### 4. Project Structure
```
backend/
  controllers/
  routes/
  services/
  models/
  middlewares/
  utils/
  config/
  types/
  tests/
  app.js
  .env
  .env.example
  package.json
  README.md
```

## Scripts
- `npm run dev` — Start server with nodemon (development)
- `npm start` — Start server (production)

## Requirements
- Node.js 22.x
- npm 10+
- Docker (for full stack dev)

---

For more details, see each folder's README or comments in the code. 