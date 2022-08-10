const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const multer = require('multer');
const path = require('path');
const templates = require("../lib/templates");
const { request } = require("http");
const { sendNotification } = require("./push.js");

router.get("/post", async (req, res) => {
    if(!req.user) {
        res.write(`<script type="text/javascript">alert('Please Login First !!')</script>`);
        res.write(`<script>window.location="/api/auth/login"</script>`);
        res.end();
    }
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

//이미지 업로드를 위한 multer
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, 'uploads/')
        },
        filename: function (req, file, callback) {
            callback(null, new Date().valueOf() + path.extname(file.originalname))
        }
    }),
});

const fileFields = upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'file', maxCount: 8 },
])

router.post("/post", fileFields, async (req, res) => {
    const { img, file } = req.body.files;
    let count;
    if(req.body.files.file){
        count=Object.keys(file).length;
    }
    const post = req.body;
    const date=new Date();
    const sc_notice_id=date % 10000;
    const title = post.title;
    const content = post.content;
    const sc_notice_img = req.body.files.img == undefined ? '' : req.body.files.img[0].path;
    const sc_notice_file = req.body.files.file == undefined ? '' : req.body.files.file[0].path;
    const sql=`INSERT INTO student_council_notice(no, title, content, iduser, upload_time, edited_date, views, img, file_status) VALUES(?,?,?,?,?,?,?,?,?)`
    const params=[sc_notice_id, title, content, "111865899156782818991", date, date, 0, sc_notice_img, count > 0 ? 1 : 0];

    try {
        const data = await pool.query(sql,params);

        const [sub_data] = await pool.query(
            `SELECT subscribe FROM subscriptions WHERE subscribe is not null`
        );
        // /거기가 ture인 사용자들의sub가져와 
        
        const message = {
            message: `학생회 공지가 새로 올라왔습니다!`,
        };
        console.log(sub_data);
        sub_data.map((subscribe) => {
            sendNotification(JSON.parse(subscribe.subscribe), message);
        })
        //알림 보내기
        // sendNotification(sub_data, message)
        //     .then((response) => {
        //     if (response.statusCode === 201) {
        //         logger.success("알림이 전송!");
        //     } else {
        //         logger.info(response);
        //     }
        // })
        // .catch((err) => logger.error(err.body.trim()));

        res.write(`<script type="text/javascript">alert('Student Council notice post Success !!')</script>`);
        res.write(`<script>window.location="/api/student_council_notice_list"</script>`);
        res.end();
    } catch (err) {
        console.error(err);
        res.write('<script>window.location="/"</script>');
    }
      //첨부파일 여러개 table에 저장
    for(let i=0;i<count;i++){
        try {
            const data = await pool.query(`INSERT INTO file_sc(no, file_infoN, file_originN) VALUES(?,?,?)`,[sc_notice_id, req.files.file[i].path, req.files.file[i].originalname]);
        } catch (err) {
            console.error(err);
        }
    }
});

module.exports = router;
