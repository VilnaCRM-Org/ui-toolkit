FROM node:20-alpine3.17

RUN apk add --no-cache python3 make g++ \
    && npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml checkNodeVersion.js ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
