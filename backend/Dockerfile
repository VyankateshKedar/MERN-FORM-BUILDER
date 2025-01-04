# Use an official Node.js image as the base image
FROM node:16-alpine

# Install build tools required for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ bash

# Set environment variables
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json first
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Rebuild native modules to match the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
