// server.js
// NET Stop HTTP
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql2');
const { log } = require('console');
const app = express();
const port = 3000;

//Localhost:80 또는 3000으로 들어오는 요청을 받음
app.get('/', (req, res) => {
    res.send("Docker With Nodejs")
})

app.use(express.json());
// post 요청 시 값을 객체로 바꿔줌
app.use(express.urlencoded({ extended: true }));

//정적 파일 제공하기위한 static
//현재 '/store_images_volume' 의 디렉토리에 있는 정적 파일에 외부 접근을 허용한 상태
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

app.get("/db/storeinfo/:crn", (req, res) =>{
    const crn = req.params.crn
    connection.query(
        `SELECT * FROM STORE_INFO WHERE crn = '${crn}'`,
        (err, result, fields) => {
            if (!err) {
                // 쿼리가 성공하면 결과를 클라이언트에게 보냄
                const storeInfo = result[0];
                if(storeInfo){
                    const imgPath = storeInfo.image_path;

                    // 이미지 경로 삭제
                    delete storeInfo.image_path;

                    // 이미지를 Base64로 인코딩
                    const imageBase64 = fs.readFileSync(imgPath, 'base64');

                    // 이미지와 result 데이터를 함께 응답
                    const responseData = {
                        image: imageBase64,
                        result: storeInfo
                    };

                    res.json(responseData);
                }else{
                    res.status(404).send("Store not found");
                }
            } else {
                // 쿼리 오류 시 에러를 클라이언트에게 보냄
                console.error("Error executing query:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    )
})

app.get("/db/companyregisternumber", (req, res) =>{
    connection.query(
        'SELECT crn FROM STORE_INFO',
        (err, result, fields) => {
            if (!err) {
                console.log(result)
                if (result && result.length > 0) {
                    // 결과가 있을 때 (하나 이상의 행이 반환된 경우)

                    // 여기서는 배열의 첫 번째 행의 'crn' 속성을 응답으로 보내고 있습니다.
                    res.json(result);
                }else{
                    res.status(404).send("Store not found");
                }
            } else {
                console.error("Error executing query:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    )
})

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
