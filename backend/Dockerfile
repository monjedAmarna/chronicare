# Backend Dockerfile for Node.js/Express
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./

# Install netcat for database connectivity checking and nodemon globally + local dependencies
RUN apk add --no-cache netcat-openbsd && npm install -g nodemon && npm install

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Make startup script executable and start the backend
RUN chmod +x startup.sh
CMD ["./startup.sh"]
