const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const multer = require("multer");
const templates = require("../lib/templates");
const path = require("path");

//이미지 업로드를 위한 multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
});

router.post("/", upload.single("img"), async (req, res) => {
  const post = req.body;
  const title = post.title;
  const content = post.content;
  const end_date = post.end_date;
  const img = req.file == undefined ? "" : req.file.path;
  try {
    const data = await pool.query(
      `INSERT INTO edu_contest(title, content, img, iduser, end_date) VALUES(?, ?, ?, ?, ?)`,
      [title, content, img, iduser, end_date]
    );
    
    //알람
    //교육 공모전 알람 ON한 사용자들
    const edu_data = await pool.query(
      `SELECT subscribe FROM subscriptions WHERE edu_contest and subscribe is not null`
    );
    const message = {
      message: `교육 공모전 글이 새로 올라왔습니다!`,
    };
    console.log(edu_data);
    edu_data.map((subscribe) => {
        sendNotification(JSON.parse(subscribe.subscribe), message);
    })

    res.json({
      title: title,
      content: content,
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/expire", async (req, res) => {
  const post = req.body;
  const post_no = post.no;
  const con_exp_time = post.con_exp_time ? 1 : 0;
  const now = new Date();
  try {
    if (con_exp_time) {
      const data = await pool.query(
        `UPDATE edu_contest SET end_date=? WHERE no = ?`,
        [now, post_no]
      );
    }
    // res.writeHead(302, {
    //   Location: "/api/edu_contest_list",
    // });
    // res.end();
    res.json({
      no: no,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
