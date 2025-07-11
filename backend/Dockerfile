# Backend Dockerfile for Node.js/Express
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Start the backend using the dev script
CMD ["npm", "run", "dev"] 