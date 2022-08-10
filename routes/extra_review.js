const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");

// router.get("/", async (req, res) => {
//   const title = "대외활동 후기글 모아보기";
//   const head = ``;
//   const body = `
//   <form action="/api/extra_review_write" method ="post">
//   <p>${req.user.name}</p>
//   <label> 제목: 
//     <input type = "text" name = "title" placeholder = "제목을 작성하세요" /> </label>
//     <br>
//     <br>
//     <label> 내용: 
//     <input type = "textarea" name = "content" placeholder = "내용을 작성하세요" /> </label>
//     <br>
//     <button type="submit"><b>입력</b></button>
//     </form>
//   `;

//   var html = templates.HTML(title, head, body);
//   res.send(html);
// });

router.post("/", async (req, res) => {
  const post = req.body;
  const title = post.title;
  const content = post.content;
  try {
    const data = await pool.query(
      `INSERT INTO extra_review(title, content, iduser) VALUES(?, ?, ?)`,
      [title, content, req.user.id]
    );

    //알람
    //대외 활동 후기 알람 ON한 사용자들
    const extra_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE extra_review and subscribe is not null`
    );
    const message = {
      message: `대외 활동 후기 글이 새로 올라왔습니다!`,
    };
    console.log(extra_data);
    extra_data.map((subscribe) => {
        sendNotification(JSON.parse(subscribe.subscribe), message);
    })
    
    res.json({data:data});
    // res.redirect(`/api/extra_review_detail/${data[0].insertId}`);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
