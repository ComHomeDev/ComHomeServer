const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.get("/:notice_id", async (req, res) => {
  const notice_id = path.parse(req.params.notice_id).base;

  //조회수 +1
  try {
    const data = await pool.query(
      "UPDATE recruit_intern set views=views+1 where no =? ",
      [notice_id]
    );
  } catch (err) {
    console.error(err);
  }

  const data = await pool.query(`SELECT * FROM recruit_intern where no = ?`, [
    notice_id,
  ]);
  const file_data = await pool.query(`SELECT * FROM file_intern where no = ?`, [
    notice_id,
  ]);

  res.json({
    data_det: data[0][0],
    file: file_data[0],
  });
});

module.exports = router;
