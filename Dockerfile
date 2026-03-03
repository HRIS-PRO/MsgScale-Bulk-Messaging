FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Install a static file server
RUN npm install -g serve

EXPOSE 8080

# Serve the built dist folder on port 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
