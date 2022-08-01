const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");

router.post("/", async (req, res) => {
  const post = req.body;
  const title = post.title;
  const cont = post.desc;

  console.log(title);
  console.log(cont);

  try {
    const data = await pool.query(
      `INSERT INTO job_review(title, cont, iduser) VALUES(?, ?, ?)`,
      [title, cont, req.user.id]
    );
    res.redirect(`/api/job_review_detail/${data[0].insertId}`);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
