FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

COPY . .

RUN npm run build

FROM node:20-alpine

FROM nginx:alpine AS production

RUN rm/etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
