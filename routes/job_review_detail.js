const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:review_no", async (req, res) => {
  const review_no = path.parse(req.params.review_no).base;
  const data = await pool.query(`SELECT * FROM job_review where no = ?`, [
    review_no,
  ]);
  res.json({
    data_det: data[0][0],
  });
});

module.exports = router;
