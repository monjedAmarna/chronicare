# Frontend Dockerfile for Vite + React (monorepo root context)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files from root
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy only the frontend source code
COPY src ./src
COPY vite.config.ts tsconfig.json postcss.config.js tailwind.config.ts index.html ./

# Expose Vite dev server port
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev", "--", "--host"] 