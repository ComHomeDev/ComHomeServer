const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");
const multer = require('multer');
const path = require('path');

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

router.get("/cs_notice_write", async (req, res) => {
  const title = "학과 공지";
  const head = ``;
  const body = `
  <form action="/cs_notice_write" method ="post" enctype="multipart/form-data">
  <p>${req.user.name}</p>
  <label> 제목: 
    <input type = "text" name = "notice_title" placeholder = "제목을 작성하세요" required/> </label>
    <br>
    <br>
    <label> 내용: 
    <input type = "textarea" name = "notice_cont" placeholder = "내용을 작성하세요" required /> </label>
    <br>
    <br>
    <label> 사진:
    <input type='file' name='img' accept='image/jpg, image/png, image/jpeg' />
    <br>
    <button type="submit"><b>완료</b></button>
    </form>
  `;

  var html = templates.HTML(title, head, body);
  res.send(html);
});

router.post("/cs_notice_write", upload.single('img'), async (req, res) => {
  const post = req.body;
  const title = post.notice_title;
  const cont = post.notice_cont;
  const img = req.file == undefined ? '' : req.file.path;
  try {
    const data = await pool.query(
      `INSERT INTO cs_notice(notice_title, notice_cont, notice_img, iduser) VALUES(?, ?, ?, ?)`,
      [title, cont, img, req.user.id]
    );
    const notice_no = await pool.query(`SELECT notice_no FROM cs_notice order by notice_no desc limit 1`);
    //console.log(notice_no);
  res.redirect(`/cs_notice_detail/${notice_no[0][0].notice_no}`);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
