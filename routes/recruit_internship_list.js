const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const multer = require("multer");
const path = require("path");

//채용/인턴십 목록보기
router.get("/", async (req, res) => {
  const data = await pool.query(
    `SELECT * FROM recruit_intern ORDER BY upload_time DESC`
  );
  let data_det = data[0];

  res.json({data_det: data_det});
});

module.exports = router;
