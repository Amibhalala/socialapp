FROM node:14.17.0-alpine
WORKDIR /app
COPY package.json .
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install --only=prod
COPY build build
EXPOSE 4443
ENTRYPOINT ["node","build/index.js"]