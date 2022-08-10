const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const multer = require("multer");
const path = require("path");

// //학과공지 글 작성하기
// router.get("/post", async (req, res) => {
//     if(!req.user) {
//       res.write(`<script type="text/javascript">alert('Please Login First !!')</script>`);
//       res.write(`<script>window.location="/api/auth/login"</script>`);
//       res.end();
//     }
//     const title = "학과공지글 작성";
//     const head = ``;
//     const body = `
//     <form action="/api/cs_notice/post" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">
//     <b>학과공지글 작성</b>
//     <br>
//     <label> 제목:
//       <input type = "text" name = "title" placeholder = "제목을 작성하세요" /> </label>
//       <br>
//       <br>
//       <label> 내용:
//       <textarea name="content" placeholder = "내용을 작성하세요"></textarea></label>
//       <br>
//       <label> 사진:
//       <input type='file' name='img' accept='image/jpg, image/png, image/jpeg' /></label>
//       <br>
//       <label> 파일:
//       <input type='file' name='file' multiple/></label>

//       <button type="submit"><b>등록</b></button>
//       </form>
//     `;

//     var html = templates.HTML(title, head, body);
//     res.send(html);
//   });

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
  //req.setCharacterEncoding("utf-8");
  const {img, file} = post.files;

  let count; //파일개수
  if (post.files.file) {
    count = Object.keys(file).length;
  }

  const date = new Date();
  const notice_id = date % 10000;
  const title = post.title;
  const content = post.content;
  const notice_img = post.files.img == undefined ? "" : post.files.img[0].path;
  const notice_file =
    post.files.file == undefined ? "" : post.files.file[0].path;

  const sql = `INSERT INTO cs_notice(no, iduser, title, content, upload_time, edited_date, views, img, file_status) VALUES(?,?,?,?,?,?,?,?,?)`;
  const params = [
    notice_id,
    req.user.id,
    title,
    content,
    date,
    date,
    0,
    notice_img,
    count > 0 ? 1 : 0,
  ]; //count >0 ? 1 :0 -> 첨부파일 여부확인

  try {
    const data = await pool.query(sql, params);

    
    //알람
    //채용인턴십 알람 ON한 사용자들
    const cs_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE cs_notice and subscribe is not null`
    );
    const message = {
      message: `학과 공지글이 새로 올라왔습니다!`,
    };
    console.log(cs_data);
    cs_data.map((subscribe) => {
        sendNotification(JSON.parse(subscribe.subscribe), message);
    })

    //첨부파일 table에 저장
    for (let i = 0; i < count; i++) {
      const data_file = await pool.query(
        `INSERT INTO file_cs(no, file_infoN, file_originN) VALUES(?,?,?)`,
        [notice_id, post.files.file[i].path, post.files.file[i].originalname]
      );
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
