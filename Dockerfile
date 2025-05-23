FROM node:23.11.1-alpine
RUN mkdir -p /tmp/actual
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add -U tzdata
RUN apk add --no-cache python3 py3-pip
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]
