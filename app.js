const port = 3000;
const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");

app.use(session({secret: "MySecret", resave: false, saveUninitialized: true}));

// Passport setting
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: false}));
app.use(express.json());
//홈페이지 생성 (req.user는 passport의 serialize를 통해 user 정보 저장되어있음)
app.get("/", async (req, res) => {
  const temp = getPage("Welcome", "Welcome to visit...", getBtn(req.user));
  res.send(temp);
});

//프론트 임시로->url 바로 들어가도 된다.
const getBtn = (user) =>{
    return user !== undefined ? `${user.name} | <a href="/auth/logout">logout</a> <br><br> <a href = "/cs_notice_list">학과공지 바로가기</a> <br><br> <a href = "/extra_review_list">대외활동 후기 바로가기</a> <br><br> <a href = "/job_review_list">취업 후기 바로가기</a>`: `<a href="/auth/google">Google Login</a> <br><br> <a href = "/cs_notice_list">학과공지 바로가기</a>`;
}

const getPage = (title, description, auth) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body>
            ${auth}
            <h1>${title}</h1>
            <p>${description}</p>
        </body>
        </html>
        `;
};


//회원
app.use('/auth', require('./routes/auth'));

//대외활동
app.get("/extra_review_list", require("./routes/extra_activity_review/extra_review_list")); //글 목록
app.get("/extra_review_write", require("./routes/extra_activity_review/extra_review")); //글작성페이지
app.post("/extra_review_write", require("./routes/extra_activity_review/extra_review")); //글작성 post 요청
app.get("/extra_review_detail/:review_no", require("./routes/extra_activity_review/extra_review_detail")); //글 세부페이지

//취업후기
app.get("/job_review_list", require("./routes/job_review/job_review_list"));
app.get("/job_review_write", require("./routes/job_review/job_review"));
app.post("/job_review_write", require("./routes/job_review/job_review"));
app.get("/job_review_detail/:review_no", require("./routes/job_review/job_review_detail"));

//학과공지
app.get("/cs_notice_list", require("./routes/cs_notice/cs_notice_list"));
app.get("/cs_notice_write", require("./routes/cs_notice/cs_notice"));
app.post("/cs_notice_write", require("./routes/cs_notice/cs_notice"));
app.get("/cs_notice_detail/:notice_no", require("./routes/cs_notice/cs_notice_detail"));
app.get("/cs_notice_update/:notice_no", require("./routes/cs_notice/cs_notice_update"));
app.post("/cs_notice_update/:notice_no", require("./routes/cs_notice/cs_notice_update"));
app.get("/cs_notice_delete/:notice_no", require("./routes/cs_notice/cs_notice_delete"));



app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
