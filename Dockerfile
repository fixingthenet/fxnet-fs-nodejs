FROM node:12.11.1-stretch

ENV FORCEBUILD='20210507'
RUN apt update -y && \
    apt install -y \
    procps  \
    joe

ADD .yarnrc /root/.yarnrc
ENV APP_DIR=/code
WORKDIR $APP_DIR
ENV PATH="/install/node_modules/.bin:${PATH}"

RUN yarn global add nodemon
RUN yarn global add babel-cli

ADD package.json package.json
ADD yarn.lock yarn.lock

RUN yarn install

ADD . $APP_DIR
