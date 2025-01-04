# Use an official Node.js image as the base image
FROM node:16-alpine

# Set environment variables
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json first (to leverage Docker caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Rebuild native modules to match the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code into the container
COPY . .

# Ensure all files have the correct permissions
RUN chmod -R 755 /usr/src/app

# Expose the port your app runs on
EXPOSE 5000

# Health check (optional, useful for production monitoring)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
