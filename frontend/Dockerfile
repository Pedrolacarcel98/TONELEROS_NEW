# 🚀 DOCKERFILE PARA PRODUCCIÓN
# Nota: Para desarrollo, usa Dockerfile.dev
# Este archivo realiza un build optimizado para producción

FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
