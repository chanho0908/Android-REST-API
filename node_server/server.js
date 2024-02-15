// server.js
// NET Stop HTTP
const express = require('express');
const multer = require('multer');
const path = require('path');
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
app.use(express.static('/store_images_volume/main'));
app.use(express.static('/store_images_volume/menu'));

const fileFilter = (req, file, cb) => {
    // 확장자 필터링
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true); // 해당 mimetype만 받겠다는 의미
    } else {
        // 다른 mimetype은 저장되지 않음
        req.fileValidationError = "jpg,jpeg,png,gif,webp 파일만 업로드 가능합니다.";
        cb(null, false);
    }
};


// 디스크에 이미지 저장을 위한 multer 설정
const storeMainImageStorage = multer.diskStorage({
    destination: '/store_images_volume/main',
    filename: (req, file, cb) => {
        const fileName = 'main_img' + Date.now() +'.'+ file.originalname.split('.').pop();
        cb(null, fileName);
    },
    fileFilter : fileFilter,
    //최대 30MB
    limits: { fileSize: 30 * 1024 * 1024 } 
});

// 디스크에 이미지 저장을 위한 multer 설정
const storeMenuImageStorage = multer.diskStorage({
    destination: '/store_images_volume/menu',
    filename: (req, file, cb) => {
        const fileName = 'menu_img' + Date.now() +'.'+ file.originalname.split('.').pop();
        cb(null, fileName);
    },
    fileFilter : fileFilter,
    //최대 30MB
    limits: { fileSize: 30 * 1024 * 1024 } 
});

const uploadStoreMainImage = multer({ storage: storeMainImageStorage });
const uploadStoreMenuImage = multer({ storage: storeMenuImageStorage });

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'root',
    database: 'cloudbridge_database'
});

app.get("/db/my-store-main-image", (req, res) => {
    let imagePath = req.query.imagePath; // 요청에서 imagePath 쿼리 파라미터 추출
    
    if (!imagePath) {
        return res.status(400).send({ error: "imagePath is required" });
    }
    const imageBase64 = fs.readFileSync(imagePath, 'base64');

    const responseData = { storeMainImage: imageBase64 }

    res.setHeader('Content-Type', 'image/*');
    res.json(responseData);

});


// 모든 매장 정보를 가져오기 위한 요청
app.get("/db/storeInfo", (req, res) => {
    connection.query(
        'SELECT * FROM STORE_INFO',
        (err, results, fields) => {
            if (!err) {
                
                if (results.length > 0) {
                    const responseData = results.map( storeInfo => {
                        console.log(storeInfo)

                        // '/store_images_volume/main/main_img1707753283856.jpg'
                        //const imageBase64 = fs.readFileSync(imgPath, 'base64');
                        console.log("IMAGE_PATH: " + storeInfo.IMAGE_PATH)
                        return {
                            storeName: storeInfo.STORE_NAME,
                            imagePath: storeInfo.IMAGE_PATH,
                            ceoName: storeInfo.CEO_NAME,
                            crn: storeInfo.CRN,
                            contact: storeInfo.CONTACT,
                            address: storeInfo.ADDRESS,
                            latitude: storeInfo.LATITUDE,
                            longitude: storeInfo.LONGITUDE,
                            kind: storeInfo.KIND
                        };
                    });

                    res.setHeader('Content-Type', 'image/*');
                    res.json(responseData);
                } else {
                    console.log("MySQL에 저장된 데이터가 없습니다.")
                    res.status(404).send("No stores found");
                }
            } else {
                console.error("Error executing query:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    );
});

// 내가 등록한 매장을 확인하기 위한 요청
app.get("/db/storeInfo/:crn", (req, res) =>{
    const crn = req.params.crn
    connection.query(
        `SELECT * FROM STORE_INFO WHERE crn = ?`,
        [crn],
        (err, result, fields) => {
            if (!err) {
                // 쿼리가 성공하면 결과를 클라이언트에게 보냄
                const storeInfo = result[0];
                if(storeInfo){
                    
                    // 이미지를 Base64로 인코딩
                    //const imageBase64 = fs.readFileSync(imgPath, 'base64');            

                    // 이미지와 result 데이터를 함께 응답
                    const responseData = {
                        storeName: storeInfo.STORE_NAME,
                        imagePath: storeInfo.IMAGE_PATH,
                        ceoName: storeInfo.CEO_NAME,
                        crn: storeInfo.CRN,
                        contact: storeInfo.CONTACT,
                        address: storeInfo.ADDRESS,
                        latitude: storeInfo.LATITUDE,
                        longitude: storeInfo.LONGITUDE,
                        kind: storeInfo.KIND
                    };

                    res.setHeader('Content-Type', 'image/*');
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

// 사업자 등록번호 중복 방지를 위해
// 저장된 사업자 등록 번호를 전달합니다.
app.get("/db/all-company-registration-number", (req, res) =>{
    connection.query(
        'SELECT crn FROM STORE_INFO',
        (err, result, fields) => {
            if (!err) {
                //console.log(result)
                if (result) {
                    // 결과가 있을 때 (하나 이상의 행이 반환된 경우)
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

// 새로운 매장 정보 저장
app.post("/db/store-registration", uploadStoreMainImage.single('storeMainImage'), (req, res) => {
    console.log("post 요청이 수신 되었습니다.");

    try {
        const file = req.file;
        const storeName = req.body.storeName;
        const ceoName = req.body.ceoName;
        const CRN = req.body.crn;
        const contact = req.body.contact;
        const address = req.body.address;
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        const kind = req.body.kind;
        console.log("storeName : " + storeName);
        if (file) {
            const filePath = file.path;

            connection.query(
                'INSERT INTO STORE_INFO (CRN, STORE_NAME, IMAGE_PATH, CEO_NAME, CONTACT, ADDRESS, LATITUDE, LONGITUDE, KIND) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [CRN, storeName, filePath, ceoName, contact, address, latitude, longitude, kind],

                (err, results, fields) => {
                    if (!err) {
                        console.log("이미지가 성공적으로 저장되었습니다.");
                        res.status(200).send("이미지가 성공적으로 저장되었습니다.");
                    } else {
                        console.error("이미지 저장 실패: ", err);
                        res.status(200).send("이미지 저장 실패");
                    }
                }
            );
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("오류 발생");
    }
});

// 새로운 매장 메뉴 정보 저장
app.post("/db/store-menu", uploadStoreMenuImage.array('storeMenuImage'), (req, res) => {
    console.log("post 요청이 수신 되었습니다.");

    try {
        const files = req.files;
        const storeMenues = req.body.storeMenus; // 배열로 전달되는 데이

        if (files && storeMenues) {
            const storeMenuInfoArray = [];
        
            files.forEach((file, index) =>{
                const menuInfo = {
                    crn: storeMenues[index].crn,
                    productName: storeMenues[index].productName,
                    productQuantity: storeMenues[index].productQuantity,
                    productIntro: storeMenues[index].productIntro,
                    IMAGE_PATH: file.path
                };

                storeMenuInfoArray.push(menuInfo);
            });

            storeMenuInfoArray.forEach((menuInfo) => {

                connection.query(
                    'INSERT INTO STORE_MENU (crn, productName, productQuantity, productIntro, IMAGE_PATH) VALUES (?, ?, ?, ?, ?)',
                    [menuInfo.crn, menuInfo.productName, menuInfo.productQuantity, menuInfo.productIntro, menuInfo.IMAGE_PATH],
    
                    (err, results, fields) => {
                        if (!err) {
                            console.log("이미지가 성공적으로 저장되었습니다.");
                            res.status(200).send("이미지가 성공적으로 저장되었습니다.");
                        } else {
                            console.error("이미지 저장 실패: ", err);
                            res.status(200).send("이미지 저장 실패");
                        }
                    }
                );
            });
            res.send("이미지가 성공적으로 저장되었습니다.");
        }else {
            res.status(400).send("요청에 필요한 데이터가 누락되었습니다.");
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send("오류 발생");
    }
});

app.put("/db/modify-storeInfo", uploadStoreMainImage.single('storeMainImage'), (req, res) =>{
    console.log("put 요청이 수신 되었습니다.");

    const file = req.file;
    const storeName = req.body.storeName;
    const ceoName = req.body.ceoName;
    const crn = req.body.crn;
    const contact = req.body.contact;
    const address = req.body.address;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const kind = req.body.kind
    
    // 사용자가 이미지를 수정했을 때
    if(file){
        console.log("이미지를 전달받았습니다.");
        // 수정 이미지 경로
        const filePath = file.path;

        // 1. 기존 이미지 저장 경로 추출
        connection.query( 
            `SELECT IMAGE_PATH FROM STORE_INFO WHERE CRN = ?`,
            [crn],
            (selectErr, selectResult, selectFields) =>{
                if (selectErr) {
                    console.log("MySQL 데이터 조회 오류:", selectErr);
                    res.status(500).send("Internal Server Error");
                    return;
                }else if (selectResult.length === 0) {
                    // 해당 CRN에 대한 데이터가 없는 경우
                    console.log("해당 사업자 등록번호에 등록된 정보가 없습니다.");
                    res.status(404).send("Data not found");
                    return;
                }else{

                // 이미지 저장 경로 
                const imagePath = selectResult[0].image_path;
                console.log("imagePath : " + imagePath);

                // 파일이 존재하면 삭제
                if(fs.existsSync(imagePath)){
                    console.log("파일이 존재합니다. 이미지를 제거합니다.");
                    try{
                        fs.unlink(imagePath, (unLinkErr) => {
                            if (unLinkErr) {
                                console.error("이미지 파일 삭제 오류:", unLinkErr);
                                res.status(500).send("Internal Server Error");
                                return;
                            }
                        // 2. 업데이트 실행    
                        console.log("MySQL 데이터를 업데이트 합니다.");
                        connection.query(
                            `UPDATE STORE_INFO SET STORE_NAME=?, IMAGE_PATH=?, CEO_NAME=?, CONTACT=?, ADDRESS=?, LATITUDE=?, 
                            LONGITUDE=?, KIND=? WHERE CRN=?`,
                            [storeName, filePath, ceoName, contact, address, latitude, longitude, kind, crn],

                            (modifyErr, modifyResult, modifyFields) =>{
                                if (modifyErr) {
                                    console.error("MySQL 데이터 수정 오류:", modifyErr);
                                    res.status(500).send("Internal Server Error");
                                    return;
                                }

                                res.status(200).send(storeName + "의 데이터가 수정되었습니다. ");
                            })})
                    }catch (error) {
                        console.log(error);
                    }
                }else{
                    console.log('삭제하려는 이미지가 존재하지 않습니다.');
                }
            }}
        )
    }else{
        // 사용자가 이미지를 수정하지 않았을 때
        // 전달받은 MySQL Data만 업데이트 합니다.
        connection.query(

            `UPDATE STORE_INFO SET STORE_NAME=?, CEO_NAME=?, CONTACT=?, ADDRESS=?, LATITUDE=?, LONGITUDE=?, KIND=? WHERE CRN=?`,
            [storeName, ceoName, contact, address, latitude, longitude, kind, crn],

            (modifyErr, modifyResult, modifyFields) => {
                if (modifyErr) {
                    console.error("MySQL 데이터 수정 오류:", modifyErr);
                    res.status(500).send("Internal Server Error");
                    return;
                }

                res.status(200).send(storeName + "의 데이터가 수정되었습니다. ");
            }
        );
    }
    
})

// 데이터 삭제
app.delete("/db/delete-storeInfo/:crn",(req, res)=>{
    console.log("delete 요청이 수신 되었습니다.");
    const crn = req.params.crn;
    
    // 사업자 등록번호를 Primary Key로 저장된 이미지 경로를 가져옵니다.
    connection.query(
        `SELECT IMAGE_PATH FROM STORE_INFO WHERE CRN = ? `,
        [crn],
        (selectErr, selectResult, selectFields) =>{
            // MySQL 에러
            if (selectErr) {
                console.error("MySQL 데이터 조회 오류:", selectErr);
                res.status(500).send("Internal Server Error");
                return;
            }

            // // 해당 CRN에 대한 데이터가 없는 경우
            if (selectResult.length === 0) {
                console.log("해당 사업자 등록번호로 저장된 정보가 없습니다.")
                res.status(404).send("Data not found");
                return;
            }
            
            // 이미지 경로
            const imagePath = selectResult[0].IMAGE_PATH;

            
            // Local Directory에 이미지가 존재하면 제거
            if(fs.existsSync(imagePath)){
                try{
                    fs.unlink(imagePath, (unLinkErr) => {
                        if (unLinkErr) {
                            console.error("이미지 파일 삭제 오류:", unLinkErr);
                            res.status(500).send("Internal Server Error");
                            return;
                        }
                    
                    // 저장된 데이터 제거
                    connection.query(
                        `DELETE FROM STORE_INFO WHERE CRN = ?`,
                        [crn],
                        (delErr, delResult, delFields)=>{
                            if (delErr) {
                                console.error("MySQL 데이터 삭제 오류:", delErr);
                                res.status(500).send("Internal Server Error");
                                return;
                            }
                            // 이미지 파일과 데이터 모두 삭제 성공
                            res.status(200).send("Data and image deleted successfully");
                        }
                        )
                    })
                }catch (error) {
                    console.log(error);
                }
            }else{
                console.log('삭제하려는 이미지가 존재하지 않습니다.');
            }
        }
    )
})


app.listen(port, () => {
    console.log("서버가 3000 포트에서 실행 중입니다.");
});
