// const express = require('express');
// const multer = require('multer');
// const mysql = require('mysql2');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // MySQL 연결 설정
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'cloud_bridge'
// });

// db.connect((err) => {
//     if (err) throw err;
//     console.log('MySQL connected');
// });


// // 이미지 업로드를 위한 Multer 설정
// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + '.jpg');
//     }
// });

// // Multer 인스턴스 생성
// const upload = multer({ storage: storage });

// app.get('/', (req, res) => {
//     res.send('Hello, this is the root path!');
// });

// // Serve static files (including your HTML file)
// app.use(express.static(path.join(__dirname, '')));

// // 이미지 업로드를 처리하는 라우트
// app.post('/uploads', upload.single('image'), (req, res) => {
//     const imagePath = req.file.path;
//     const sql = 'INSERT INTO images (path) VALUES (?)';

//     db.query(sql, [imagePath], (err, result) => {
//         if (err) {
//             console.error('Error inserting image path into MySQL:', err);
//             res.status(500).send('Internal Server Error');
//         } else {
//             console.log('Image path inserted into MySQL');
//             res.send('Image uploaded successfully');
//         }
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
const express = require('express')
const app = express()
const port = 3000;

app.get('/', (req, res) => {
  res.send('Docker with nodejs')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
