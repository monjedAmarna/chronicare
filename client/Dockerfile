# Frontend Dockerfile for Vite + React (client/ structure)
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY index.html vite.config.ts tsconfig.json postcss.config.js tailwind.config.ts ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"] 