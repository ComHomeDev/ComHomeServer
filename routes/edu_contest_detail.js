const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:edu_contest_no", async (req, res) => {
  const edu_contest_no = path.parse(req.params.edu_contest_no).base;
  try {
    const data = await pool.query(
      "UPDATE edu_contest set views=views+1 where no =? ",
      [edu_contest_no]
    );
  } catch (err) {
    console.error(err);
  }
  const data = await pool.query(`SELECT * FROM edu_contest where no = ?`, [
    edu_contest_no,
  ]);

  // //댓글 조회
  // let comment_write = ``;
  // const comment = await pool.query(
  //   `SELECT * FROM edu_contest_comment WHERE edu_contest_no = ?`,
  //   [edu_contest_no]
  // );
  // let i = 0;
  // // console.log(comment[0][0]);
  // if (comment[0][0] == undefined) {
  //   //댓글 없는 경우
  //   body += "<p>아직 댓글이 없습니다.</p>";
  // } else {
  //   while (i < comment[0].length) {
  //     //댓글 있는 경우
  //     const name = await pool.query(`SELECT name FROM user WHERE iduser = ?`, [
  //       comment[0][i].iduser,
  //     ]);
  //     body += ` <div>
  //     <div>
  //     <span class="comment-content">
  //           댓글: ${comment[0][i].edu_contest_comment_cont}
  //       </span>
  //       <div>
  //           댓글 작성자: ${name[0][0].name}
  //       </div>
  //     </div>
  //   </div>
  //   `;
  //     i++;
  //   }
  // }
  // if (data[0][0].iduser == req.user.id) {
  //   comment_write = `자신의 게시글에는 댓글을 작성할 수 없습니다.`;
  // } else {
  //   comment_write += `<form class="comment" action="/api/edu_cont_comment_write" method="POST">
  //       댓글 입력:

  //       <input name="edu_contest_comment_cont" placeholder="여기에 댓글을 입력해주세요"></input>

  //       <input name="edu_contest_no" type="hidden" value="${edu_contest_no}">
  //       <br>
  //       <button type="submit">댓글 입력</button>

  //     </form>`;
  // }

  // body += ` ${comment_write} <br> <a href = "/api/edu_contest_list">목록으로 돌아가기</a><br>  `;
  // var html = templates.HTML(title, head, body);
  // res.send(html);
  res.json({
    data_det: data[0][0],
  });
});

module.exports = router;
