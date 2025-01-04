# Use an official Node.js image as the base image
FROM node:16-alpine

# Install build tools required for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ bash

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json
COPY package*.json ./

# Install dependencies and rebuild bcrypt
RUN npm ci --only=production && npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
