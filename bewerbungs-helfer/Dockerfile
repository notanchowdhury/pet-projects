# App image for the Docker / PostgreSQL setup.
FROM node:20-alpine

WORKDIR /app

# Install dependencies (includes the Prisma CLI, needed for generate + db push)
COPY package*.json ./
RUN npm ci

# App source
COPY . .

# Generate the Prisma client against the PostgreSQL schema
RUN npx prisma generate --schema=prisma/postgres/schema.prisma

# Drop root before running the app.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

# On start: apply pending Postgres migrations (real migration history), then launch.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/postgres/schema.prisma && node src/server.js"]
