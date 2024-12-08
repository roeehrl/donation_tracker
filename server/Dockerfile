
# Use the official Node.js image as a base
FROM node:16

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . ./

# Expose the backend port (assumed 4000)
EXPOSE 4000

# Command to start the backend server
CMD ["node", "server.js"]
