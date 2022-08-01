const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const multer = require("multer");
const path = require("path");

//작품전시 글 수정하기
router.post("/", async (req, res, next) => {
  console.log(req.params);
  const id = req.params["0"];
  const data = await pool.query(
    `SELECT * FROM exhibition WHERE idexhibition=${req.body.id}`
  );
  const title = "작품전시 글 수정";
  const head = ``;
  let body = `
    <form action="/api/exhibition_edit/update" method ="post" enctype="multipart/form-data" accept-charset="UTF-8">

    <table>
    <tr>
    <td>프로젝트 제목: </td>
    <td><input type="text" name="exh_title" value="${data[0][0].exh_title}"></td>
    </tr>
    <tr>
    <td>프로젝트 소개(내용) :</td>
    <td><textarea name="exh_content">${data[0][0].exh_content}</textarea></td>
    </tr>
    <tr>
    `;
  if (data[0][0].exh_img != "") {
    body += `
        <script type="text/javascript">
            function div_hide() {
                document.getElementById("showImage").style.display = "none";
                document.getElementById("deleteBtn").style.display = "none";
                document.getElementById("addImage").style.display = "block";}
        </script>

        <p>프로젝트 이미지</p>
        <img id='showImage' src="${data[0][0].exh_img}"/>
        <input type="button" id="deleteBtn" value="X(이미지삭제)" onclick="div_hide();"/>
        <input style="display:none;" type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg'/>
        `;
  } else {
    body += `
        <td>프로젝트 이미지</td>
        <td><input type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg' /></td>
        </tr>`;
  }

  body += `
    <tr>
    <td>수상경력: (없으면 빈칸) </td>
    <td><input type="text" name="exh_award" value="${data[0][0].exh_award}"> </td>
    </tr>
    <tr>
    <td>프로젝트 참가한 대회 이름: </td>
    <td><input type="text" name="exh_contestName" value="${data[0][0].exh_contestName}"></td>
    </tr>
    <br>
    <tr>
    <input type="hidden" name="id" value="${data[0][0].idexhibition}">
    <td><input type="submit" value="수정"></td>
    </tr>
    </table>

    </form>
    `;

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
  const exh_id = Number(req.body.id);
  const exh_title = req.body.exh_title;
  const exh_content = req.body.exh_content;
  const exh_award = req.body.exh_award;
  const exh_contestName = req.body.exh_contestName;
  const exh_img = req.file == undefined ? "" : req.file.path;

  const sql1 =
    "UPDATE exhibition SET exh_title=?, exh_content=?, exh_img=?, exh_award=?, exh_contestName=? WHERE idexhibition=?";
  const params1 = [
    exh_title,
    exh_content,
    exh_img,
    exh_award,
    exh_contestName,
    exh_id,
  ];

  //수정할때 이미지 추가 안한경우에는 update문에서 img 속성은 뺴야함
  const sql2 =
    "UPDATE exhibition SET exh_title=?, exh_content=?, exh_award=?, exh_contestName=? WHERE idexhibition=?";
  const params2 = [exh_title, exh_content, exh_award, exh_contestName, exh_id];

  //이미지 없으면 sql2 쿼리, 이미지 있으면 sql1 쿼리
  let sql = req.file == undefined ? sql2 : sql1;
  let params = req.file == undefined ? params2 : params1;

  try {
    const data = await pool.query(sql, params);
    res.write(
      `<script type="text/javascript">alert('Exhibition Edit Success !!')</script>`
    );
    res.write(`<script>window.location="/api/exhibition"</script>`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write('<script>window.location="/"</script>');
  }
});

//작품전시 글 삭제하기
router.post("/delete", async (req, res) => {
  //console.log(req.body);
  const exh_id = Number(req.body.id);

  const sql = "DELETE FROM exhibition WHERE idexhibition=?";
  try {
    const data = await pool.query(sql, [exh_id]);
    res.write(
      `<script type="text/javascript">alert('Exhibition Delete Success !!')</script>`
    );
    res.write(`<script>window.location="/api/exhibition"</script>`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write('<script>window.location="/"</script>');
  }
});

module.exports = router;
