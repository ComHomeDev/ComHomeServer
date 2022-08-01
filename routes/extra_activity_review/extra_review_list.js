const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");

router.get("/extra_review_list", async (req, res) => {
  const title = "대외활동 후기 게시판";
  const head = ``;
  let body = `게시글 순서 | 게시글 제목 | 작성 날짜 <br>`;
  let i = 0;
  const data = await pool.query(`SELECT * FROM extra_review ORDER BY review_no DESC`);
  const time_data = await pool.query(`SELECT date_format(upload_time, '%Y-%m-%d %H:%i:%s') FROM extra_review`);
  let data_det = data[0];

  while (i < data_det.length) {
    const data2 = await pool.query(`SELECT name FROM user where iduser = ?`, [
      data_det[i].iduser,
    ]);
    // console.log(data2[0][0].name);
    body += `<a href = "/extra_review_detail/${data_det[i].review_no}">${data_det[i].review_no}</a> | ${data_det[i].review_title} | ${time_data[0][i]["date_format(upload_time, '%Y-%m-%d %H:%i:%s')"]} <br>`;
    i++;
  }
  body += `<a href = "/extra_review_write">대외활동 후기글 작성하러 가기</a>`;
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;