FROM node:23.11.1-alpine
RUN mkdir -p /tmp/actual
RUN mkdir -p /actual/taxes
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add -U tzdata
RUN apk add --no-cache python3 py3-pip
RUN npm install
COPY app/ .
EXPOSE 49160
CMD [ "node", "index.js" ]
