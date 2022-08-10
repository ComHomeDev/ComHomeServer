const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");
const path = require("path");

router.post("/", async(req, res) => {
    // console.log(req.subscription);

    // const user = getUser(req.headers);
    // const data = JSON.parse(req.body.subscription);
    const subscription = JSON.stringify(req.body.subscription);
    const iduser = req.body.iduser;
    // console.log(subscription);
    //if iduser있으면 update, 없으면 insert그대로
    try {
        const data = await pool.query(
            `INSERT INTO subscriptions(iduser, subscribe) VALUES(?, ?)`,
            [iduser, subscription]
        );
    } catch (err) {
        console.error(err);
    }

    //db 구독한 user, 
        // // 해당 유저의 구독 정보 저장
        // const inserted = SimpleDatabase.upsert("user", {
        // where: {
        //     id: user,
        // },
        // data: {
        //     subscription,
        // },
        // });
    
        // if (inserted) {
        // if (subscription) {
        //     logger.success(`${user}님이 푸시 서비스를 구독했습니다.`);
        // } else {
        //     logger.success(`${user}님이 푸시 서비스 구독을 취소했습니다.`);
        // }
    
        // res.status(200).json({ user });
        // } else {
        // res.status(500).end();
        // }
    });
    
module.exports = router;