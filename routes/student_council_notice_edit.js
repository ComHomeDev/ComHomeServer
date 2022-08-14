const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const multer = require("multer");
const path = require("path");


// 글 수정하기
router.post("/", async (req, res, next) => {
  const data = await pool.query(
    `SELECT * FROM student_council_notice WHERE no=${req.body.no}`
  );
  const data_det = data[0][0];
  // res.json({data_det: data_det});
  const title = "학생회 공지 수정";
  const head = ``;
  let body = `
    <form action="/api/student_council_notice_edit/update" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">  
    <b>학생회 공지 작성</b>
        <br>
        <label> 제목: 
            <input type = "text" name = "title" value="${data[0][0].title}" /> </label>
        <br>
        <br>
        <label> 내용: 
            <textarea name="content">${data[0][0].content}</textarea></label>
        <br>
        <label> 시작 날짜: 
            <input type = "date" name = "start_date" value="${data[0][0].start_date}"/></label>
        <br>
        <label> 종료 날짜: 
            <input type = "date" name = "end_date" value = "${data[0][0].end_date}"/></label>
        <br>
        <label> 파일: 
            <input type='file' name='file' multiple/></label>
            <br>
    `;
  if (data[0][0].img != "") {
    body += `
        <script type="text/javascript">
            function div_hide() {
                document.getElementById("showImage").style.display = "none";
                document.getElementById("deleteBtn").style.display = "none";
                document.getElementById("addImage").style.display = "block";}
        </script>
        <img id='showImage' src="${data[0][0].img}"/>
        <label> 사진: 
        <input type="button" id="deleteBtn" value="X(이미지삭제)" onclick="div_hide();"/>
        <input style="display:none;" type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg'/>
        </br>
        `;
  } else {
    body += `
        <label> 사진: 
            <input type='file' name='img' accept='image/jpg, image/png, image/jpeg' /></label>
            <br>
        `;
  }

  body += `
        <input type="hidden" name="no" value="${data[0][0].no}">
        <input type="submit" value="수정">
        </form>
    `;

  var html = templates.HTML(title, head, body);
  res.send(html);
});

//이미지 업로드를 위한 multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, img, callback) {
      callback(null, "uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
});

//수정한 글 db에 저장
router.post("/update", upload.single("img"), async (req, res) => {
  const no = req.body.no;
  const title = req.body.title;
  const content = req.body.content;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const date = new Date();
  const img = req.file == undefined ? "" : req.file.path;
  let status = 404;

  //, file_status=?
  const sql1 =
    "UPDATE student_council_notice SET title=?, content=?, edited_date=?, start_date=?, end_date=? WHERE no=?";
  const params1 = [title, content, date, start_date, end_date, no];
  //, file_status=?
  const sql2 =
    "UPDATE student_council_notice SET title=?, content=?, img=?, edited_date=?, start_date=?, end_date=? WHERE no=?";
  const params2 = [title, content, img, date, start_date, end_date, no];

  //이미지 없으면 sql2 쿼리, 이미지 있으면 sql1 쿼리
  let sql = req.file == undefined ? sql2 : sql1;
  let params = req.file == undefined ? params2 : params1;

  try {
    const data = await pool.query(sql, params);

    //학생회 공지 알람 ON한 사용자들
    const subscribe_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE student_council_notice and subscribe is not null`
    );
    
    const message = {
      message: `학생회 공지가 수정되었습니다!`,
    };
    subscribe_data.map((subscribe) => {
        sendNotification(JSON.parse(subscribe.subscribe), message);
    })

    status = 200;
  } catch (err) {
    console.error(err);
  }
  res.json({
    status: status,
  });
});

//작품전시 글 삭제하기
router.post("/delete", async (req, res) => {
  const no = req.body.no;
  let status = 404;
  
  const file_status = await pool.query(
    `SELECT file_status FROM student_council_notice WHERE no=${no}`
  );

  if (file_status[0][0].file_status == 1) {
    const data = await pool.query(`DELETE FROM file_sc WHERE no=?`, [no]);
  }

  try {
    const data = await pool.query(`DELETE FROM student_council_notice WHERE no=?`, [no]);
    status = 200;
  } catch (err) {
    console.error(err);
  }
  res.json({
    status: status,
  });
});

module.exports = router;