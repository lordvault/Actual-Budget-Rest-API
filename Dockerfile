FROM node:18.18.0-alpine
RUN mkdir -p /tmp/actual
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]