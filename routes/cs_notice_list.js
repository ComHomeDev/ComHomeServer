const express = require("express");
const router = express.Router();
const pool = require("../db.js");

//채용/인턴십 목록보기
router.get("/", async (req, res) => {
  let i = 0;
  const data = await pool.query(
    `SELECT * FROM cs_notice ORDER BY upload_time DESC`
  );
  let data_det = data[0];

  res.json({data_det: data_det});
});

module.exports = router;
