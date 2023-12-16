## docker-entrypoint.sh for node.js
## 컨테이너 내부에서 cmd작업을 할 수 있도록 해주는 파일
## MySQL 서버가 준비되기 전까지 다음 단계로 진행되지 않음
## mysql : Docker Compose에서 지정한 이름
echo "wait db server"
dockerize -wait tcp://mysql:3306 -timeout 40s

echo "start node server"
nodemon server.js