require("dotenv").config();
const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");

router.get("/cs_notice_list", async (req, res) => {
  const title = "학과공지";
  const head = ``;
  let body = `게시글 순서 | 게시글 제목 | 작성 날짜 <br>`;
  let i = 0;
  const data = await pool.query(`SELECT * FROM cs_notice ORDER BY upload_time DESC`);
  const time_data = await pool.query(`SELECT date_format(upload_time, '%Y-%m-%d') FROM cs_notice`);
  let data_det = data[0];

  while (i < data_det.length) {
    const data2 = await pool.query(`SELECT name FROM user where iduser = ?`, [
      data_det[i].iduser,
    ]);
    body += `<a href = "/cs_notice_detail/${data_det[i].notice_no}"><div>${data_det[i].notice_title} | ${time_data[0][i]["date_format(upload_time, '%Y-%m-%d')"]}</div></a>`;
    i++;
  }
  if(req.user!=undefined && req.user.email==process.env.CS_NOTICE_KEY){
    body += `<a href = "/cs_notice_write">공지사항 작성</a>`;
  }
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;