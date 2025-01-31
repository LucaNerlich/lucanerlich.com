# https://sreyaj.dev/deploy-nodejs-applications-on-a-vps-using-coolify-with-dockerfile
FROM node:20-alpine

# install curl for healthcheck
RUN apk --no-cache add curl

ARG PORT

ENV PORT=$PORT

# https://stackoverflow.com/a/65443098/4034811
WORKDIR /app

COPY package*.json /app

ENV NODE_ENV=production
RUN npm install && npm run generate && npm run coolify-build && npm cache clean --force && rm -rf node_modules

COPY . /app

# Expose port
EXPOSE $PORT

# Start the Docusaurus application
CMD ["npm", "run", "coolify"]
