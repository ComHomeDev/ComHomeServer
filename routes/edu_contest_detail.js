const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/edu_contest_detail/:edu_contest_no", async (req, res) => {
  const edu_contest_no = path.parse(req.params.edu_contest_no).base;
  const title = edu_contest_no + "번 게시글";
  const head = ``;
  const data = await pool.query(
    `SELECT * FROM edu_contest where edu_contest_no = ?`,
    [edu_contest_no]
  );

  function getCheckboxValue(event) {
    let result = "";
    if (event.target.checked) {
      result = event.target.value;
    } else {
      result = "";
    }

    document.getElementById("my_checkbox").innerText = result;
  }

  let body = `<p>${data[0][0].edu_contest_title}</p> 
  <p>${data[0][0].edu_contest_cont}</p>
  <strong>댓글</strong><br>
  `;

  //댓글 조회
  let comment_write = ``;
  const comment = await pool.query(
    `SELECT * FROM edu_contest_comment WHERE edu_contest_no = ?`,
    [edu_contest_no]
  );
  let i = 0;
  if (comment[0][0] == undefined) {
    //댓글 없는 경우
    body += "<p>아직 댓글이 없습니다.</p>";
  } else {
    while (i < comment[0].length) {
      //댓글 있는 경우
      const name = await pool.query(`SELECT name FROM user WHERE iduser = ?`, [
        comment[0][i].iduser,
      ]);
      if (comment[0][i].secret_check == 0) {
        //비밀 댓글이 아니라면
        body += ` <div>
      <div>
        <div>
            <!--댓글 작성자: ${name[0][0].name}-->
            익명
        </div>
        <span class="comment-content">
            
            댓글: ${comment[0][i].edu_contest_comment_cont} 
        </span>
        
      </div>
    </div>
    `;
      } else {
        //비밀 댓글이라면
        if (
          data[0][0].iduser == req.user.id ||
          req.user.id == comment[0][i].iduser
        ) {
          //자신의 게시글이거나 본인이 쓴 댓글이라면
          body += ` <div>
              <div>
                <div>
                <!--댓글 작성자: ${name[0][0].name}-->
                 익명
                </div>
              <span class="comment-content">
                댓글: ${comment[0][i].edu_contest_comment_cont} 
              </span>        
            </div>
          </div>
        `;
        } else {
          //본인이 쓴 댓글이 아니라면
          body += ` <div>
          <div>
            <div>
            <!--댓글 작성자: ${name[0][0].name}-->
             익명
            </div>
          <span class="comment-content">
           비밀댓글입니다. 
          </span>        
        </div>
      </div>
    `;
        }
      }
      i++;
    }
  }
  if (data[0][0].iduser == req.user.id) {
    comment_write = `자신의 게시글에는 댓글을 작성할 수 없습니다.`;
  } else {
    comment_write += `<form class="comment" action="/edu_cont_comment_write" method="POST">
        <input type="checkbox" id='my_checkbox' /> 
        비밀댓글 <input name="edu_contest_comment_cont" placeholder="여기에 댓글을 입력해주세요"></input>
        <input name="edu_contest_no" type="hidden" value="${edu_contest_no}">
        <br> 
        <input type = "hidden" name = "secret_check" value = "1" onclick="getCheckboxValue(event)"/>
        <button type="submit">입력</button>
        </form>`;
  }

  body += ` ${comment_write} <br> <a href = "/edu_contest_list">목록으로 돌아가기</a><br>  `;
  var html = templates.HTML(title, head, body);
  res.send(html);
});

module.exports = router;
