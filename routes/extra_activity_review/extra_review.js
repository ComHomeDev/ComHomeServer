const express = require("express");
const router = express.Router();
const passport = require("../../config/passport.js");
const pool = require("../../db.js");
const templates = require("../../lib/templates");

router.get("/extra_review_write", async (req, res) => {
  const title = "대외활동 후기글 모아보기";
  const head = ``;
  const body = `
  <form action="/extra_review_write" method ="post">
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

router.post("/extra_review_write", async (req, res) => {
  const post = req.body;
  const title = post.review_title;
  const cont = post.review_cont;
  try {
    const data = await pool.query(
      `INSERT INTO extra_review(review_title, review_cont, iduser) VALUES(?, ?, ?)`,
      [title, cont, req.user.id]
    );
    const head = ``;
    const body = `
    <h3>${title}</h3>
    <p>${cont}</p>

    <a href="/extra_review_list">목록으로 돌아가기</a>
    `;
  
    var html = templates.HTML(title, head, body);
    res.send(html);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;