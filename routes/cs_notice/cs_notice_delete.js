const express = require("express");
const router = express.Router();
const pool = require("../../db.js");
const templates = require("../../lib/templates");
const path = require("path");

router.get("/cs_notice_delete/:notice_no", async (req, res) => {
    const notice_no = path.parse(req.params.notice_no).base;
    const data = await pool.query(`SELECT * FROM cs_notice where notice_no=?`, [notice_no]);
  if(req.user.id!=data[0][0].iduser) res.send("권한이 없습니다.");
  else{
    try {
        const deleteData= await pool.query(`DELETE FROM cs_notice where notice_no =? `, [notice_no]);
        res.redirect(`/cs_notice_list`);
      } catch (err) {
        console.error(err);
      }
  }

});

module.exports = router;
