FROM node:18.18.0-alpine
RUN mkdir -p /tmp/actual
COPY app/base-taxes.yml /tmp/actual/
RUN mkdir -p /usr/src/tax
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add -U tzdata
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]