const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");

router.get("/", async (req, res) => {
    const title = "학생회 공지";
    const head = ``;
    let body = `게시글 넘버 | 게시글 제목 | 조회수 | 작성 날짜 <br>`;
    let i = 0;
    const data = await pool.query(
    `SELECT * FROM student_council_notice ORDER BY upload_time DESC`
    );
    const time_data = await pool.query(`SELECT date_format(upload_time, '%Y-%m-%d') FROM student_council_notice ORDER BY upload_time DESC`);
    let data_det = data[0];

    while (i < data_det.length) {
        const data2 = await pool.query(`SELECT name FROM user where iduser = ?`, [
        data_det[i].iduser,
        ]);
        let timestamp = data_det[i].upload_time;
        body += `<a href = "/api/student_council_notice_detail/${data_det[i].no}">${data_det.length-i}</a> | ${data_det[i].title} | ${data_det[i].views} | ${time_data[0][i]["date_format(upload_time, '%Y-%m-%d')"]} <br>`;
        i++;
    }
    body += `<br><a href = "/api/student_council_notice_check">학생회 공지 작성하기</a> <br> <a href="/"> 홈으로 돌아가기 </a>`;
    var html = templates.HTML(title, head, body);
    res.send(html);
});

module.exports = router;
