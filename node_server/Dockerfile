# image
# 사용할 기본 이미지를 지정
# Alpine Linux의 Node.js 버전 14입니다. Alpine Linux는 경량 배포판
FROM node:14-alpine

# WORKDIR은 명령을 실행하기 위한 디렉토리를 설정합니다.
WORKDIR /usr/src/node

# root 폴더에 있는 package-lock.json를 /usr/src/node 복제합니다
COPY package-lock.json /usr/src/node
# root 폴더에 있는 package.json를 /usr/src/node 복제합니다
COPY package.json /usr/src/node
# package.json에 있는 module을 install합니다
RUN npm install

# node_modules가 설치 된 이후 root(.) directory전체를 복제합니다.
COPY . /usr/src/node

EXPOSE 3000

# script를 실행합니다.
CMD ["npm","run","start"]