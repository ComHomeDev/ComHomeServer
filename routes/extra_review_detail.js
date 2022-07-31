const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:review_no", async (req, res) => {
  if (!req.user.id) res.send("로그인이 필요한 서비스 입니다.");

  const review_no = path.parse(req.params.review_no).base;

  try {
    const data = await pool.query(
      "UPDATE extra_review set views=views+1 where no =? ",
      [review_no]
    );
  } catch (err) {
    console.error(err);
  }
  const data = await pool.query(`SELECT * FROM extra_review where no = ?`, [
    review_no,
  ]);

  res.json({
    data_det: data[0][0],
  });
});

module.exports = router;
