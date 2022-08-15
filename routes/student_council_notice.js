const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const path = require('path');
const templates = require("../lib/templates");
const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');
const {format} = require('util');

const storage = new Storage({
  projectId: "comhome-7cab0",
  keyFilename: "\config\\comhome-7cab0-firebase-adminsdk-dc7ia-e24746dcd5.json"
});

const bucket = storage.bucket("comhome-7cab0.appspot.com");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

router.get("/post", async (req, res) => {
    // if(!req.user) {
    //     res.write(`<script type="text/javascript">alert('Please Login First !!')</script>`);
    //     res.write(`<script>window.location="/api/auth/login"</script>`);
    //     res.end();
    // }
    //
    const title = "학생회 공지글 작성";
    const head = ``;
    const body = `
    <form action="/api/student_council_notice/post" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">
        <b>학생회 공지 작성</b>
        <br>
        <label> 제목: 
            <input type = "text" name = "title" placeholder = "제목을 작성하세요" /> </label>
        <br>
        <br>
        <label> 내용: 
            <textarea name="content" placeholder = "내용을 작성하세요"></textarea></label>
        <br>
        <label> 사진: 
            <input type='file' name='img' accept='image/jpg, image/png, image/jpeg' /></label>
            <br>
        <label> 파일: 
            <input type='file' name='file' multiple/></label>
        <button type="submit"><b>등록</b></button>
    </form>
    `;
    
    var html = templates.HTML(title, head, body);
    res.send(html);
});

//이미지 업로드를 위한 multer >> 없애도 될듯
// const upload = multer({
//     storage: multer.diskStorage({
//         destination: function (req, file, callback) {
//             callback(null, 'uploads/')
//         },
//         filename: function (req, file, callback) {
//             callback(null, new Date().valueOf() + path.extname(file.originalname))
//         }
//     }),
// });


// const fileFields = upload.fields([
//     { name: 'img', maxCount: 1 },
//     { name: 'file', maxCount: 8 },
// ])

router.post("/post", multer.single('file'), async (req, res) => {
    //const { img, file } = req.files;
    let count;
    // if(req.files.file){
    //     count=Object.keys(file).length;
    // }

    let file = req.file;
    //console.log(file);

    if (file) {
      uploadImageToStorage(file).then((success) => {
        res.status(200).send({
          status: 'success'
        });
      }).catch((error) => {
        console.error(error);
      });
    }

    const post = req.body;
    const date=new Date();
    const sc_notice_id=date % 10000;
    const title = post.title;
    const content = post.content;
    //const sc_notice_img = req.files.img == undefined ? '' : req.files.img[0].path;
    //const sc_notice_file = req.files.file == undefined ? '' : req.files.file[0].path;
    //const sql=`INSERT INTO student_council_notice(no, title, content, iduser, upload_time, edited_date, views, img, file_status) VALUES(?,?,?,?,?,?,?,?,?)`
    //const params=[sc_notice_id, title, content, req.user.id, date, date, 0, sc_notice_img, count > 0 ? 1 : 0];

    // try {
    //     const data = await pool.query(sql,params);
    //     res.write(`<script type="text/javascript">alert('Student Council notice post Success !!')</script>`);
    //     res.write(`<script>window.location="/api/student_council_notice_list"</script>`);
    //     res.end();
    // } catch (err) {
    //     console.error(err);
    //     res.write('<script>window.location="/"</script>');
    // }
    //   //첨부파일 여러개 table에 저장
    // for(let i=0;i<count;i++){
    //     try {
    //         const data = await pool.query(`INSERT INTO file_sc(no, file_infoN, file_originN) VALUES(?,?,?)`,[sc_notice_id, req.files.file[i].path, req.files.file[i].originalname]);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }
});

/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
 const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No image file');
      }

      //한글파일 이름
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

      let newFileName = `${file.originalname}_${Date.now()}`;
      console.log(newFileName);

      let fileUpload = bucket.file('files/'+newFileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('error', (error) => {
        console.log(error);
        reject('Something is wrong! Unable to upload at the moment.');
      });
  
      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const url = format(`https://storage.googleapis.com/${bucket.name}/files/${fileUpload.name}`);
        resolve(url);
      });
  
      blobStream.end(file.buffer);
    });
  }

module.exports = router;
