FROM node:18-slim

WORKDIR /app

# Install server dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Install client dependencies and build
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

# Copy all source
COPY . .

# Build client
RUN cd client && npm run build

# Setup database
RUN node server/db/setup.js

EXPOSE 3000

CMD ["node", "server/index.js"]
