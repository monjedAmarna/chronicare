# ChronicareHealth Frontend

## Local Development

You can run the frontend locally with:

```bash
npm install
npm run dev
```

## Docker Development (Recommended)

The frontend can be run as part of the full stack using Docker Compose:

```bash
docker-compose up
```

This will start the frontend (Vite dev server on port 5173), backend, MySQL, and phpMyAdmin. Access the app at [http://localhost:5173](http://localhost:5173).

### Hot Reload

The frontend service uses a volume mount for live reload during development. 