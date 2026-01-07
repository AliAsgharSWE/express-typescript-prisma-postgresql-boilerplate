# Build Stage
FROM node:18-alpine as builder

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY .env.example ./.env

# Install ALL dependencies (needed to build)
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./

USER appuser
EXPOSE 4300

CMD ["npm", "start"]

