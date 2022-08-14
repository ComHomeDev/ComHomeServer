const express = require("express");
const router = express.Router();
const pool = require("../db.js");

router.post("/post", async (req, res) => {
  const post = req.body;
  const title = post.title;
  const content = post.content;
  const now = new Date();

  try {
    const data = await pool.query(
      `INSERT INTO job_review(title, content, edited_date, iduser) VALUES(?, ?, ?, ?)`,
      [title, content, now, iduser]
    );
    
    //알람
    //취업 후기 알람 ON한 사용자들
    const job_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE job_review and subscribe is not null`
    );
    const message = {
      message: `취업 후기 글이 새로 올라왔습니다!`,
    };
    job_data.map((subscribe) => {
        sendNotification(JSON.parse(subscribe.subscribe), message);
    })

  } catch (err) {
    console.error(err);
  }
  let no = data[0].insertId;
  res.json({no: no});
});

module.exports = router;
