const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:sc_notice_no", async (req, res) => {
  const sc_notice_no = path.parse(req.params.sc_notice_no).base;

  //조회수 +1
  try {
    const data = await pool.query(
      "UPDATE student_council_notice set views=views+1 where no =? ",
      [sc_notice_no]
    );
  } catch (err) {
    console.error(err);
  }

  // const title = sc_notice_no + "번 게시글";
  // const head = `<meta charset="UTF-8">
  // <meta http-equiv="X-UA-Compatible" content="IE=edge">
  // <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  const data = await pool.query(
    `SELECT * FROM student_council_notice where no = ?`,
    [sc_notice_no]
  );
  const file_data = await pool.query(`SELECT * FROM file_sc where no = ?`, [
    sc_notice_no,
  ]);

  // let body = `<p>제목: ${data[0][0].sc_notice_title}</p>
  // <p>작성일: ${time_data[0][0]["date_format(sc_created_date, '%Y-%m-%d')"]}</p>
  // <p>수정일: ${time_data2[0][0]["date_format(sc_edited_date, '%Y-%m-%d')"]}</p>
  // <p>조회수: ${data[0][0].sc_views}</p>
  // <p>글번호: ${sc_notice_no}</p>
  // <p><b>=첨부파일=</b></p>
  // `

  // if(file_data[0].length>0){
  //     for(let i=0; i < file_data.length; i++) {
  //         let filename=file_data[0][i].file_infoN.substr(8);
  //         body +=`<a href = "/download/${filename}">${file_data[0][i].file_originN}</a><br>`;
  //     }
  // }else{
  //     body +=`<p>첨부파일이(가) 없습니다.</p>`
  // }
  // body+=`
  // <hr>
  // <div>
  // <img src="${data[0][0].sc_img}" />
  // </div>
  // <p>내용: ${data[0][0].sc_notice_cont}</p>
  // <a href = "/api/student_council_notice_list">목록으로 돌아가기</a>
  // `;
  // var html = templates.HTML(title, head, body);
  // res.send(html);
});

module.exports = router;
