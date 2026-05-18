# Build from Frontend/ monorepo root (see docker-compose build context)
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json ./
COPY packages/trackify-shared/package.json ./packages/trackify-shared/
COPY master-app/package.json ./master-app/
RUN npm install

COPY packages/trackify-shared ./packages/trackify-shared
COPY master-app ./master-app
RUN npm run build -w master-app

FROM nginx:stable-alpine
COPY --from=build /app/master-app/dist /usr/share/nginx/html
RUN sed -i '10i \    location / { \n        try_files $uri $uri/ /index.html; \n    }' /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
