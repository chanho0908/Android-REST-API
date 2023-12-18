// server.js
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Localhost:80 또는 3000으로 들어오는 요청을 받음
app.get('/', (req, res) => {
    res.send("Docker With Nodejs")
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//정적 파일 제공하기위한 static
//현재 '/imgaes' 의 디렉토리에 있는 정적 파일에 외부 접근을 허용한 상태
app.use(express.static('/store_images_volume'));


// 디스크에 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: '/store_images_volume',
    filename: (req, file, cb) => {
        const fileName = 'main_img' + Date.now() +'.'+ file.originalname.split('.').pop();
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'root',
    database: 'cloudbridge_database'
});

app.post("/db/upload", upload.single('storeimage'), (req, res) => {
    console.log("post 요청이 수신 되었습니다.");

    try {
        const file = req.file;
        const storename = req.body.storename;
        const ceoName = req.body.ceoName;
        const CRN = req.body.CRN;
        const contact = req.body.contact;
        const address = req.body.address;
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        const kind = req.body.kind;

        if (file) {
            const filePath = file.path;

            connection.query(
                'INSERT INTO STORE_INFO(STORENAME, IMAGE_PATH, ceoName, CRN, contact, address, latitude, longitude, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [storename, filePath, ceoName, CRN, contact, address, latitude, longitude, kind],

                (err, results, fields) => {
                    if (!err) {
                        console.log("이미지가 성공적으로 저장되었습니다.");
                        res.send("이미지가 성공적으로 저장되었습니다.");
                        //res.status(200).send("이미지가 성공적으로 저장되었습니다.");
                    } else {
                        console.error("이미지 저장 실패: ", err);
                        res.send("이미지가 저장 실패.");
                        //res.status(200).send("이미지 저장 실패");
                    }
                }
            );
        }
    } catch (err) {
        console.error(err);
        //res.status(500).send("오류 발생");
    }
});

app.listen(port, () => {
    console.log("서버가 3000 포트에서 실행 중입니다.");
});
