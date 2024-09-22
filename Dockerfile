# syntax = docker/dockerfile:1.2
FROM alpine as alpine
RUN apk add --no-cache git
RUN echo "libunistring.so.5"

FROM node:22-alpine
COPY --from=alpine /usr/ /usr/

WORKDIR /usr/app
COPY package.json .
RUN npm install && npm install typescript -g
COPY src/ src/
COPY static/ static/
COPY devDexServer/ devDexServer/
COPY tsconfig.json tsconfig.json 
RUN  "tsc"

EXPOSE 32990
WORKDIR /usr/app/devDexServer/
RUN --mount=type=secret,id=config.ts,dst=/usr/app/devDexServer/config.ts "tsc"
CMD [ "npm", "run", "run" ]