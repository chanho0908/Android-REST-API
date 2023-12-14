const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();

// 디스크에 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) return cb(err);
            const fileName = req.body.storename + '_main_img.' + file.originalname.split('.').pop();
            cb(null, fileName);
        });
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

app.post("/db/postImg", upload.single('storeimage'), (req, res) => {
    try {
        const file = req.file;
        const storename = req.body.storename;

        if (file) {
            const filePath = file.path;

            connection.query(
                'INSERT INTO STORE_IMAGES (STORENAME, IMAGE_PATH) VALUES (?, ?)',
                [storename, filePath],
                (err, results, fields) => {
                    if (!err) {
                        console.log("이미지가 성공적으로 저장되었습니다.");
                        res.send("이미지가 성공적으로 저장되었습니다.");
                    } else {
                        console.error("이미지 저장 실패: ", err);
                        res.send("이미지 저장 실패");
                    }
                }
            );
        }
    } catch (err) {
        console.error(err);
        res.send("오류 발생");
    }
});

app.listen(3000, () => {
    console.log("서버가 3000 포트에서 실행 중입니다.");
});
