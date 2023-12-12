# 사용할 기본 이미지를 지정
# Alpine Linux의 Node.js 버전 14 Alpine Linux는 경량 배포판
FROM node:14-alpine

# DOCKERIZE_VERSION 모듈 설치
# docker-compose에서 docker 컨테이너 간의 실행 순서를 동기화
ENV DOCKERIZE_VERSION v0.2.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# nodemon 모듈 설치
RUN npm install -g nodemon
RUN mkdir -p /usr/src/app

# WORKDIR은 명령을 실행하기 위한 디렉토리를 설정합니다.
WORKDIR /usr/src/app

# root 폴더에 있는 package.json를 /usr/src/app 복제합니다
COPY package.json /usr/src/app
# root 폴더에 있는 package-lock.json를 /usr/src/app 복제합니다
COPY package-lock.json /usr/src/app
# package.json에 있는 module을 install합니다
RUN npm install

# root(.) directory 전체를 복제합니다.
COPY . /usr/src/app

RUN chmod +x docker-entrypoint.sh

# script를 실행합니다.
CMD ["./docker-entrypoint.sh"]
