FROM node:20.0.0

WORKDIR /flamy
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml .
RUN pnpm install
COPY . .