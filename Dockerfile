FROM node:8.0.0-alpine

WORKDIR /root/api

RUN apk add --no-cache bash git openssh-client

COPY package.json ./

COPY yarn.lock ./

# install cf-api required binaries
RUN apk add --no-cache --virtual deps python make g++ krb5-dev && \
    yarn install --production && \
    yarn cache clean && \
    apk del deps && \
    rm -rf /tmp/*

# copy app files
COPY . ./

#application server
EXPOSE 9000

# run application
CMD ["node", "index.js"]
