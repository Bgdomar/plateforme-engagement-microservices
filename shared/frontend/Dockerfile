# shared/frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install --no-audit --no-fund

COPY . .

ARG API_URL=http://localhost:8080
ARG FACIAL_AI_URL=http://localhost:8000

RUN echo "window.__env = {" > src/env.js && \
    echo "  API_URL: '${API_URL}'," >> src/env.js && \
    echo "  FACIAL_AI_URL: '${FACIAL_AI_URL}'" >> src/env.js && \
    echo "};" >> src/env.js

RUN npm run build -- --configuration=production

# ===== RUNTIME =====
FROM node:20-alpine

WORKDIR /app

# Installer express pour le server.js
RUN npm install express

# Copier les fichiers buildés
COPY --from=build /app/dist/plateforme-web/browser ./public

# Copier env.js
COPY --from=build /app/src/env.js ./public/env.js

# Copier le serveur Express
COPY server.js .

EXPOSE 4200

CMD ["node", "server.js"]
