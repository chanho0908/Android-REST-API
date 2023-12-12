## docker-entrypoint.sh for node.js

## mysql : Docker Compose에서 지정한 이름
echo "wait db server"
dockerize -wait tcp://mysql:3306 -timeout 20s

echo "start node server"
nodemon server.js