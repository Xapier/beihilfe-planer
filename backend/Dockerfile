FROM node:18-alpine

WORKDIR /app

# Installiere Dependencies
COPY package*.json ./
RUN npm install --production

# Kopiere den Source Code
COPY src ./src

# Port für API
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Starte den Server
CMD ["npm", "start"]
