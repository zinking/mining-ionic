FROM sinet/nginx-node:latest

MAINTAINER zinking3@gmail.com
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y git

RUN npm install \
    && npm run bower -- install --allow-root \
    && npm run gulp -- build

RUN mkdir /mining-ionic

RUN git clone https://github.com/zinking/mining-ionic.git /mining-ionic

RUN cd /mining-ionic && bower install

RUN ln -sfn /data/mining-ionic/volume/default.conf /etc/nginx/conf.d/default.conf
RUN ln -sfn /data/mining-ionic/volume/SessionService.js /mining-ionic/www/js/session/services/SessionService.js

CMD ["nginx", "-g", "daemon off;"]


