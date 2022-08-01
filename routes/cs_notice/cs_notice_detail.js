const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");
const path = require("path");

router.get("/cs_notice_detail/:notice_no", async (req, res) => {

  const notice_no = path.parse(req.params.notice_no).base;
  //조회수 +1
  try {
    const data = await pool.query("UPDATE cs_notice set notice_views=notice_views+1 where notice_no =? ", [notice_no]);
  } catch (err) {
    console.error(err);
  }

  const title = notice_no + "번 게시글";
  const head = ``;
  const data = await pool.query(`SELECT * FROM cs_notice where notice_no = ?`,[notice_no]);
  const time_data = await pool.query(`SELECT date_format(upload_time, '%Y-%m-%d %H:%i:%s') FROM cs_notice`);
  const body = `
  <p>제목 ${data[0][0].notice_title}</p>
  <p>조회수 ${data[0][0].notice_views}</p>
  <p>작성시간 ${time_data[0][0]["date_format(upload_time, '%Y-%m-%d %H:%i:%s')"]}</p> 
  <img src="${data[0][0].notice_img}" />
  <br>
  <p>${data[0][0].notice_cont}</p>

  <a href="/cs_notice_update/${notice_no}">편집</a>
  <a href="/cs_notice_delete/${notice_no}">삭제</a>

  <a href = "/cs_notice_list">목록으로 돌아가기</a>
  `;
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;