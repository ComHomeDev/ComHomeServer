const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:review_no", async (req, res) => {
  if (!req.user.id) res.send("로그인이 필요한 서비스 입니다.");

  const review_no = path.parse(req.params.review_no).base;
  console.log(review_no);
  const title = review_no + "번 게시글";
  const head = ``;
  const data = await pool.query(`SELECT * FROM extra_review where no = ?`, [
    review_no,
  ]);
  const body = `<p>${data[0][0].review_title}</p> 
  <p>${data[0][0].review_cont}</p>
  <a href = "/api/extra_review_list">목록으로 돌아가기</a>
  `;
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;
