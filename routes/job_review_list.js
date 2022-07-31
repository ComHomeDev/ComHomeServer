const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");

router.get("/", async (req, res) => {
  const data = await pool.query(
    `SELECT * FROM job_review ORDER BY upload_time DESC`
  );
  let data_det = data[0];
  res.json({data_det: data_det});
});

module.exports = router;
