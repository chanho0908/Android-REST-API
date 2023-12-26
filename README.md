# Android Node Server

## 안드로이드 프로젝트용 REST API
## ✔ Docker Container 구성
>Web SERVER : Nginx   
BackEnd : Node.JS   
DBMS : MySQL
<hr> 

![image](https://github.com/chanho0908/android_Docker_server/assets/84930748/3d11cfdd-3320-41ce-9031-c55e8ca525ce)

#### 🎉 [GET] 사업자 등록번호 조회 Request
```
app.get("/db/companyregisternumber", (req, res) =>{
    connection.query(
        'SELECT crn FROM STORE_INFO',
        (err, result, fields) => {
            if (!err) {
                console.log(result)
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
```
![image](https://github.com/chanho0908/android_Docker_server/assets/84930748/b7675af7-f436-4a46-a17f-a39591359e63)

#### 🎉 [GET] 등록된 나의 매장 Request
```

app.get("/db/storeinfo/:crn", (req, res) =>{
    const crn = req.params.crn
    connection.query(
        `SELECT * FROM STORE_INFO WHERE crn = ?`,
        [crn],
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

                    res.setHeader('Content-Type', 'image/*');

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
```

#### 🎉 [POST] 나의 매장 등록 Request
```

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
```

![image](https://github.com/chanho0908/android_Docker_server/assets/84930748/a4007651-58e6-4f90-bc3b-c7e1763b2c93)

#### 🎉 [PUT] 매장 정보 수정
```
app.put("/db/modify-storeinfo", upload.single('storeimage'), (req, res) =>{
    console.log("put 요청이 수신 되었습니다.");

    const file = req.file;
    const storename = req.body.storename;
    const ceoName = req.body.ceoName;
    const crn = req.body.CRN;
    const contact = req.body.contact;
    const address = req.body.address;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const kind = req.body.kind;

    console.log(storename);
    console.log(file);
    if (file) {
        // 수정 이미지 경로
        const filePath = file.path;

        // 1. 기존 이미지 저장 경로 추출
        connection.query( 
            `SELECT image_path FROM STORE_INFO WHERE CRN = ?`,
            [crn],
            (selectErr, selectResult, selectFields) =>{
                if (selectErr) {
                    console.error("MySQL 데이터 조회 오류:", selectErr);
                    res.status(500).send("Internal Server Error");
                    return;
                }

                if (selectResult.length === 0) {
                    // 해당 CRN에 대한 데이터가 없는 경우
                    res.status(404).send("Data not found");
                    return;
                }
                
                // 이미지 저장 경로 
                const imagePath = selectResult[0].image_path;
                console.log(imagePath);

                // 파일이 존재하면 삭제
                if(fs.existsSync(imagePath)){
                    try{
                        fs.unlink(imagePath, (unLinkErr) => {
                            if (unLinkErr) {
                                console.error("이미지 파일 삭제 오류:", unLinkErr);
                                res.status(500).send("Internal Server Error");
                                return;
                            }
                        // 2. 업데이트 실행    
                        connection.query(
                            `UPDATE STORE_INFO SET STORENAME=?, ceoName=?, contact=?, address=?, latitude=?, longitude=?, kind=?, image_path=? WHERE CRN=?`,
                            [storename, ceoName, contact, address, latitude, longitude, kind, filePath, crn],

                            (modifyErr, modifyResult, modifyFields) =>{
                                if (modifyErr) {
                                    console.error("MySQL 데이터 수정 오류:", modifyErr);
                                    res.status(500).send("Internal Server Error");
                                    return;
                                }

                                res.status(200).send("Data and image deleted successfully");
                            }

                        
                            )})
                    }catch (error) {
                        console.log(error);
                    }
                }else{
                    console.log('삭제하려는 이미지가 존재하지 않습니다.');
                }

            }
        )
    }   
    
})
```
![image](https://github.com/chanho0908/android_Docker_server/assets/84930748/06458a40-1bfb-4650-960d-285a0c5628aa)

#### 🎉 [DELETE] 매장 삭제
```
app.delete("/db/delete-storeinfo/:crn",(req, res)=>{
    console.log("delete 요청이 수신 되었습니다.");
    const crn = req.params.crn;
    
    connection.query(
        `SELECT image_path FROM STORE_INFO WHERE CRN = ? `,
        [crn],
        (selectErr, selectResult, selectFields) =>{
            if (selectErr) {
                console.error("MySQL 데이터 조회 오류:", selectErr);
                res.status(500).send("Internal Server Error");
                return;
            }

            if (selectResult.length === 0) {
                // 해당 CRN에 대한 데이터가 없는 경우
                res.status(404).send("Data not found");
                return;
            }
            
            const imagePath = selectResult[0].image_path;
            
            if(fs.existsSync(imagePath)){
                try{
                    fs.unlink(imagePath, (unLinkErr) => {
                        if (unLinkErr) {
                            console.error("이미지 파일 삭제 오류:", unLinkErr);
                            res.status(500).send("Internal Server Error");
                            return;
                        }

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
```
![image](https://github.com/chanho0908/android_Docker_server/assets/84930748/0abbf702-a3ed-426f-9370-1510607a7f21)


