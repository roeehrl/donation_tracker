
# Use the official Node.js image as a base
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app and build it
COPY . ./
RUN npm run build

# Use a lightweight server to serve the built files
FROM node:16-slim AS production
WORKDIR /app

# Install 'serve' to serve static files
RUN npm install -g serve

# Copy the built files from the build stage
COPY --from=build /app/dist ./dist

# Expose the default Vite port
EXPOSE 3000

# Command to serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
