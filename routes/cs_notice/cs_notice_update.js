const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");
const path = require("path");

router.get("/cs_notice_update/:notice_no", async (req, res) => {
    const notice_no = path.parse(req.params.notice_no).base;
    const data = await pool.query(`SELECT * FROM cs_notice where notice_no=?`, [notice_no]);
  if(req.user.id!=data[0][0].iduser) res.send("권한이 없습니다.");
  else{
    const title = "학과 공지";
    const head = ``;
    const body = `
    <form action="/cs_notice_update/${notice_no}" method ="post" enctype="multipart/form-data">
    <p>${req.user.name}</p>
    <label> 제목: 
      <input type = "text" name = "notice_title" value = ${data[0][0].notice_title} required/> </label>
      <br>
      <br>
      <label> 내용: 
      <input type = "textarea" name = "notice_cont" value = ${data[0][0].notice_cont} required /> </label>
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
  }

});

router.post("/cs_notice_update/:notice_no", async (req, res) => {
    const notice_no = path.parse(req.params.notice_no).base;
    const post = req.body;
    const title=post.notice_title;
    const content=post.notice_cont;
    try {
        const updateData= await pool.query("UPDATE cs_notice set notice_title=?, notice_cont=? where notice_no =? ", [title, content, notice_no]);
        res.redirect(`/cs_notice_detail/${notice_no}`);
      } catch (err) {
        console.error(err);
      }
});


module.exports = router;