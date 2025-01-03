# Use an official Node.js image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install dependencies
# --production flag is used to install only production dependencies
RUN npm install --production

# Rebuild native modules to match the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code into the container
COPY . .

# Expose the application port
EXPOSE 5000

# Command to start the application
CMD ["npm", "start"]
