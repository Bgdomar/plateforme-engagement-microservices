# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install \
  && node -p "'tailwindcss=' + require('tailwindcss/package.json').version" \
  && npm ls tailwindcss
COPY . .
RUN npm run build -- --configuration production

# Serve stage - uses express to handle SPA routing
FROM node:20-alpine
WORKDIR /app

# Install express and body-parser for serving Angular SPA
RUN npm init -y \
  && npm install express body-parser

# Copy Angular browser build output
COPY --from=builder /app/dist/plateforme-web/browser ./public

EXPOSE 4200

# Create a simple Express server to handle Angular routing
RUN cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

// Serve static files with cache disabled
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false
}));

// SPA routing: all non-file requests go to index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(4200, () => {
  console.log('Angular app listening on http://0.0.0.0:4200');
});
EOF

CMD ["node", "server.js"]
