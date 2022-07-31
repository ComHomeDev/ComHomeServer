const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:notice_id", async (req, res) => {

    const notice_id = path.parse(req.params.notice_id).base;
    console.log(notice_id);

    //조회수 +1
    try {
        const data = await pool.query("UPDATE recruit_intern set not_views=not_views+1 where notice_id =? ",[notice_id]);
    } catch (err) {
        console.error(err);
    }

    const title = notice_id + "번 게시글";
    const head = `<meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    const data = await pool.query(`SELECT * FROM recruit_intern where notice_id = ?`,[notice_id]);
    const file_data = await pool.query(`SELECT * FROM file_intern where notice_id = ?`,[notice_id]);
    const time_data = await pool.query(`SELECT date_format(not_created_date, '%Y-%m-%d') FROM recruit_intern`);
    const time_data2 = await pool.query(`SELECT date_format(not_edited_date, '%Y-%m-%d') FROM recruit_intern`);

    //console.log(data[0][0].not_img);

    let body = `<p>제목: ${data[0][0].not_title}</p>
    <p>작성일: ${time_data[0][0]["date_format(not_created_date, '%Y-%m-%d')"]}</p>
    <p>수정일: ${time_data2[0][0]["date_format(not_edited_date, '%Y-%m-%d')"]}</p>
    <p>조회수: ${data[0][0].not_views}</p>
    <p>글번호: ${notice_id}</p>
    <p><b>=첨부파일=</b></p>
    `
    console.log(file_data[0]);
    if(file_data[0].length>0){
     for(let i=0; i < file_data.length; i++) {
        //console.log(file_data[0][i]);
        //console.log(file_data[0][i].file_infoN);
        let filename=file_data[0][i].file_infoN.substr(8);
        body +=`<a href = "/download/${filename}">${file_data[0][i].file_originN}</a><br>`;
        }
    }else{
        body +=`<p>첨부파일이(가) 없습니다.</p>`
    }
    body+=`
    <hr>
    <div>
    <img src="${data[0][0].not_img}" />
    </div>
    <p>내용: ${data[0][0].not_content}</p>
    <a href = "/recruit_internship_list">목록으로 돌아가기</a>
    `;
    var html = templates.HTML(title, head, body);
    res.send(html);
});

module.exports = router;