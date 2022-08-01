const express = require("express");
const router = express.Router();
const passport = require("../config/passport.js");
const pool = require("../db.js");
const templates = require("../lib/templates");

router.get("/", async (req, res) => {
    const title = "학생회 공지 모아보기";
    const head = ``;
    const body = `
    <form action="/api/student_council_notice_check" method ="post">
    <p>${req.user.name}</p>
    <label> 비밀번호: 
        <input type = "password" name = "sc_password" placeholder = "비밀번호를 입력하세요" /> </label>
        <br>
        <button type="submit"><b>확인</b></button>
    </form>
    `;

    var html = templates.HTML(title, head, body);
    res.send(html);
});

router.post("/", async (req, res) => {
    const post = req.body;
    const sc_password = post.sc_password;

    if(sc_password.length > 0){
        if(sc_password == process.env.STUDENT_COUNCIL_PASSWORD) {
            res.redirect(`/api/student_council_notice/post`);
        }
        else {
            res.write(`<script type="text/javascript">alert('password does not correct!')</script>`);
            res.write('<script>window.location="/api/student_council_notice_list"</script>')
        }
    }
    else {
        res.write(`<script type="text/javascript">alert('Fill in blanks')</script>`);
        res.write('<script>window.location="/api/student_council_notice_list"</script>')
    }
});

module.exports = router;