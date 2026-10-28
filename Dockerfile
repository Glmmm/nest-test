# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# Stage 2: Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

USER node

COPY package*.json ./
    
RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]