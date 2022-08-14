const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.post("/", async(req, res) => {
    const subscription = JSON.stringify(req.body.subscription);
    const iduser = req.body.iduser;

    const [data] = await pool.query(
        'SELECT iduser FROM subscriptions where iduser = ?',
        [iduser]
    );

    console.log(data.length);

    if (data.length != 0){  //알림 취소
        try {
            const data = await pool.query(
                'DELETE FROM subscriptions where iduser = ?',
                [iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    }
    else{   //알림 설정
        try {
            const data = await pool.query(
                `INSERT INTO subscriptions(iduser, subscribe) VALUES(?, ?)`,
                [iduser, subscription]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    }
});

router.post("/sub", async(req, res) => {
    const iduser = req.body.iduser;
    const type = req.body.type;
    
    if (type == "recruit_intern"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET recruit_intern=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "exhibition"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET exhibition=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "student_council_notice"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET student_council_notice=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "job_review"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET job_review=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "edu_contest"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET edu_contest=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "cs_notice"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET cs_notice=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "extra_review"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET extra_review=? WHERE iduser = ?',
                [1, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } 
});
    
router.post("/sub_cancel", async(req, res) => {
    const iduser = req.body.iduser;
    const type = req.body.type;
    
    if (type == "recruit_intern"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET recruit_intern=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "exhibition"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET exhibition=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "student_council_notice"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET student_council_notice=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "job_review"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET job_review=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "edu_contest"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET edu_contest=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "cs_notice"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET cs_notice=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } else if (type == "extra_review"){
        try {
            const data = await pool.query(
                'UPDATE subscriptions SET extra_review=? WHERE iduser = ?',
                [0, iduser]
            );
            res.json({data:data});
        } catch (err) {
            console.error(err);
        }
    } 
});
    
module.exports = router;