const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");

router.get("/job_review_write", async (req, res) => {
  const title = "취업 후기글 모아보기";
  const head = ``;
  const body = `
  <form action="/job_review_write" method ="post">
  <p>${req.user.name}</p>
  <label> 제목: 
    <input type = "text" name = "review_title" placeholder = "제목을 작성하세요" /> </label>
    <br>
    <br>
    <label> 내용: 
    <input type = "textarea" name = "review_cont" placeholder = "내용을 작성하세요" /> </label>
    <br>
    <button type="submit"><b>입력</b></button>
    </form>
  `;

  var html = templates.HTML(title, head, body);
  res.send(html);
});

router.post("/job_review_write", async (req, res) => {
  const post = req.body;
  const title = post.review_title;
  const cont = post.review_cont;
  //   const time = new Date().getTime().valueOf(); // 현재 시간
  try {
    const data = await pool.query(
      `INSERT INTO job_review(review_title, review_cont, iduser) VALUES(?, ?, ?)`,
      [title, cont, req.user.id]
    );
    console.log("됐음");
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
