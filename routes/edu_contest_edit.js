const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const multer = require("multer");
const path = require("path");

//작품전시 글 수정하기
router.post("/", async (req, res, next) => {
  //   console.log(req.params);
  //   const id = req.params["0"];
  const no = req.body.no;
  const data = await pool.query(`SELECT * FROM edu_contest WHERE no=${no}`);
  const title = "교육/공모전 글 수정";
  const head = ``;
  let body = `
    <form action="/api/edu_contest_edit/update" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">
    
    <table>
    <tr>
    <td>교육/공모전 제목: </td>
    <td><input type="text" name="title" value="${data[0][0].title}"></td>
    </tr>
    <tr>
    <td>교육/공모전 소개(내용) :</td>
    <td><textarea name="content">${data[0][0].content}</textarea></td>
    </tr>
    <tr>
    <input type="hidden" name="no" value="${data[0][0].no}">
    </tr>
    <tr>
    `;
  if (data[0][0].img != "") {
    body += `
        <script type="text/javascript">
            function div_hide() {
                document.getElementById("showImage").style.display = "none";
                document.getElementById("deleteBtn").style.display = "none";
                document.getElementById("addImage").style.display = "block";}
        </script>

        <p>교육/공모전 이미지</p>
        <img id='showImage' src="${data[0][0].img}"/>
        <input type="button" id="deleteBtn" value="X(이미지삭제)" onclick="div_hide();"/>
        <input style="display:none;" type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg'/>
        `;
  } else {
    body += `
        <td>교육/공모전 이미지</td>
        <td><input type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg' /></td>
        `;
  }
  body += `   
  </tr> 
  <td><input type="submit" value="수정"></td>
  </table>
  </form>`;

  var html = templates.HTML(title, head, body);
  res.send(html);
});

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

//수정한 글 db에 저장
router.post("/update", upload.single("img"), async (req, res) => {
  //console.log("exhibiton-EDIT/update 입성!");
  const no = Number(req.body.no);
  const title = req.body.title;
  const content = req.body.content;
  const img = req.file == undefined ? "" : req.file.path;

  const sql1 = await pool.query(
    `UPDATE edu_contest SET title=?, content=?, img=? WHERE no=?`,
    [title, content, img, no]
  );

  //수정할때 이미지 추가 안한경우에는 update문에서 img 속성은 뺴야함
  const sql2 = await pool.query(
    "UPDATE edu_contest SET title=?, content=? WHERE no=?",
    [title, content, no]
  );

  //이미지 없으면 sql2 쿼리, 이미지 있으면 sql1 쿼리
  let sql = req.file == undefined ? sql2 : sql1;
  // let params = req.file == undefined ? params2 : params1;

  try {
    // const data = await pool.query(sql, params);
    res.write(
      `<script type="text/javascript">alert('Edu_contest Edit Success !!')</script>`
    );
    res.write(
      `<script>window.location="/api/edu_contest_detail/${no}"</script>`
    );
    res.end();
  } catch (err) {
    console.error(err);
    res.write('<script>window.location="/"</script>');
  }
});

//작품전시 글 삭제하기
router.post("/delete", async (req, res) => {
  //console.log(req.body);
  const no = Number(req.body.no);

  const sql = "DELETE FROM edu_contest WHERE no=?";
  try {
    const data = await pool.query(sql, [no]);
    res.write(
      `<script type="text/javascript">alert('Edu_contest Delete Success !!')</script>`
    );
    res.write(`<script>window.location="/api/edu_contest_list"</script>`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write('<script>window.location="/"</script>');
  }
});

module.exports = router;