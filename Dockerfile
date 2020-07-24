FROM node:12.14.1-alpine3.9

WORKDIR /app

COPY . .

RUN yarn install

CMD [ "yarn", "start" ]