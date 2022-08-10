const fcm = require('firebase-admin');
const express = require("express");
const router = express.Router();

let fcm_cert = require('../comhome-4cdb8-firebase-adminsdk-fa0c1-0c19882819.json')

fcm.initializeApp({ 
	credential: fcm.credential.cert(fcm_cert), 
})

router.get('/v1/push', (req, res) => {

    let deviceToken = [
        "디바이스에서 앱 설치시 디바이스 토큰1",
        "디바이스에서 앱 설치시 디바이스 토큰2",
    ]

    let message = {
        notification:{
            title:'테스트 발송',
            body:'테스트 푸쉬 알람!',
        },
        tokens:deviceToken,
    }

    // [멀티 캐스트]
    fcm.messaging().sendMulticast(message)
        .then((response) => {
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(deviceToken[idx]);
                    }
                });
                console.log('List of tokens that caused failures: ' + failedTokens);
            }
            return res.status(200).json({success: true})
        });
});