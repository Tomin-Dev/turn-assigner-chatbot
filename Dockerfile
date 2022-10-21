FROM node:16-alpine as base
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package.json
COPY web/package.json web/package.json
COPY api/package.json api/package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/releases .yarn/releases

RUN yarn install --immutable --inline-builds

COPY redwood.toml .
COPY graphql.config.js .

COPY . .

RUN yarn rw prisma generate

CMD [ "yarn", "rw", "exec", "startChatbot" ]
