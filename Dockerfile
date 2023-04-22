FROM node:18.16.0-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cp /etc/secrets/.env .

RUN npm run build

FROM node:18.16.0-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./
COPY --from=builder /app/prisma ./prisma


EXPOSE 8080
CMD [ "npm", "run", "start:migrate:prod" ]