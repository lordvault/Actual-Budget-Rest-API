FROM node:20.12.1-alpine
RUN mkdir -p /tmp/actual
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add -U tzdata
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]