# -------------------------
# 1) Build stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# build the Docusaurus site
RUN npm run generate && npm run coolify-build

# -------------------------
# 2) Production stage
# -------------------------
FROM node:20-alpine

WORKDIR /app

# copy only necessary artifacts from build stage
COPY --from=builder /app /app

RUN npm ci --production && npm cache clean --force

ARG PORT
ENV PORT=$PORT
ENV NODE_ENV=production

EXPOSE $PORT

CMD ["npm", "run", "coolify"]
