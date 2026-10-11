# Imagem da API (NestJS) para o Cloud Run.
FROM node:20-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# o postinstall roda "prisma generate" -> gera ./generated/prisma
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER node
# Cloud Run injeta PORT=8080; main.ts ja le process.env.PORT
CMD ["node", "dist/main"]
