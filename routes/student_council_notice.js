const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const multer = require("multer");
const path = require("path");
const templates = require("../lib/templates");
const {request} = require("http");

// router.get("/post", async (req, res) => {
//     if(!req.user) {
//         res.write(`<script type="text/javascript">alert('Please Login First !!')</script>`);
//         res.write(`<script>window.location="/api/auth/login"</script>`);
//         res.end();
//     }
//     //
//     const title = "학생회 공지글 작성";
//     const head = ``;
//     const body = `
//     <form action="/api/student_council_notice/post" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">
//         <b>학생회 공지 작성</b>
//         <br>
//         <label> 제목:
//             <input type = "text" name = "title" placeholder = "제목을 작성하세요" /> </label>
//         <br>
//         <label> 내용:
//             <textarea name="content" placeholder = "내용을 작성하세요"></textarea></label>
//         <br>
//         <label> 시작 날짜:
//         <input type = "date" name = "start_date"/> </label>
//         <br>
//         <label> 종료 날짜:
//         <input type = "date" name = "end_date"/> </label>
//         <br>
//         <label> 사진:
//             <input type='file' name='img' accept='image/jpg, image/png, image/jpeg' /></label>
//             <br>
//         <label> 파일:
//             <input type='file' name='file' multiple/></label>
//         <button type="submit"><b>등록</b></button>
//     </form>
//     `;

//     var html = templates.HTML(title, head, body);
//     res.send(html);
// });

//이미지 업로드를 위한 multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
});

const fileFields = upload.fields([
  {name: "img", maxCount: 1},
  {name: "file", maxCount: 8},
]);

router.post("/post", fileFields, async (req, res) => {
  const post = req.body;
  const {img, file} = post.files;

  let count;
  if (post.files.file) {
    count = Object.keys(file).length;
  }

  const date = new Date();
  const sc_notice_id = date % 10000;
  const title = post.title;
  const content = post.content;
  const sc_notice_img =
    post.files.img == undefined ? "" : post.files.img[0].path;
  const sc_notice_file =
    post.files.file == undefined ? "" : post.files.file[0].path;
  const start_date = post.start_date;
  const end_date = post.end_date;
  const sql = `INSERT INTO student_council_notice(no, title, content, iduser, upload_time, edited_date, views, img, file_status, start_date, end_date) VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [
    sc_notice_id,
    title,
    content,
    req.body.iduser,
    date,
    date,
    0,
    sc_notice_img,
    count > 0 ? 1 : 0,
    start_date,
    end_date,
  ];

  try {
    const data = await pool.query(sql, params);

    //알람
    //학생회 공지 알람 ON한 사용자들
    const subscribe_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE student_council_notice and subscribe is not null`
    );
    const message = {
      message: `학생회 공지가 새로 올라왔습니다!`,
    };
    subscribe_data.map((subscribe) => {
      sendNotification(JSON.parse(subscribe.subscribe), message);
    });

    //첨부파일 table에 저장
    for (let i = 0; i < count; i++) {
      try {
        const data_file = await pool.query(
          `INSERT INTO file_sc(no, file_infoN, file_originN) VALUES(?,?,?)`,
          [sc_notice_id, req.files.file[i].path, req.files.file[i].originalname]
        );
        res.json({data: data, data_file: data_file});
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
  let no = data[0].insertId;
  res.json({no: no, data_file: data_file});
});

module.exports = router;
