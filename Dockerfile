# syntax = docker/dockerfile:1.2

FROM node:22-alpine

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

