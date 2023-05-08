FROM node:18.16.0-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

RUN npm ci --omit=dev
COPY . .

RUN npm run build

FROM node:18.16.0-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./
COPY --from=builder /app/prisma ./prisma

COPY _credentials/gcp-storage.json /etc/secrets/private/

EXPOSE ${port}
CMD [ "npm", "run", "start:migrate:prod" ]