const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");
const path = require("path");

router.get("/job_review_detail/:review_no", async (req, res) => {
  const review_no = path.parse(req.params.review_no).base;
  console.log(review_no);
  const title = review_no + "번 게시글";
  const head = ``;
  const data = await pool.query(
    `SELECT * FROM job_review where review_no = ?`,
    [review_no]
  );
  const body = `<p>${data[0][0].review_title}</p> 
  <p>${data[0][0].review_cont}</p>
  <a href = "/job_review_list">목록으로 돌아가기</a>
  `;
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;
