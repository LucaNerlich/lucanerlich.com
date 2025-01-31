# -------------------------
# 1) Build stage
# -------------------------
FROM node:20-alpine AS builder

# set working directory
WORKDIR /app

# copy dependency files first for caching
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of your source code
COPY . .

# build the Docusaurus site
RUN npm run generate && npm run coolify-build

# -------------------------
# 2) Production stage
# -------------------------
FROM node:20-alpine

# set working directory
WORKDIR /app

# copy only necessary artifacts from build stage
COPY --from=builder /app /app

# remove unused files or directories if desired
# e.g., RUN rm -rf node_modules

# install only production dependencies
RUN npm ci --production && npm cache clean --force

# set environment variables
ARG PORT
ENV PORT=$PORT
ENV NODE_ENV=production

# expose port
EXPOSE $PORT

# start the Docusaurus application
CMD ["npm", "run", "coolify"]
