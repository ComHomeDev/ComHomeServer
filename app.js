const port = 5000;
const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

app.use(cors());
app.use(session({secret: "MySecret", resave: false, saveUninitialized: true}));

// Passport setting
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/uploads", express.static(__dirname + "/uploads"));

//홈페이지 생성 (req.user는 passport의 serialize를 통해 user 정보 저장되어있음)
app.get("/", async (req, res) => {
  const temp = getPage("Welcome", "Welcome to visit...", getBtn(req.user));
  // const data = getHtml(); 크롤링 확인하려고..
  res.send(temp);
});

//프론트 임시로->url 바로 들어가도 된다.
const getBtn = (user) => {
  return user !== undefined
    ? `${user.name} | <a href="/api/auth/logout">logout</a> <br><br> <a href = "/api/extra_review_list">대외활동 후기 바로가기</a> <br><br> <a href = "/api/job_review_list">취업 후기 바로가기</a> <br><br> <a href = "/api/edu_contest_list">교육/공모전 글 바로가기</a> <br><br> <a href = "/api/student_council_notice_list">학생회 공지</a>`
    : `<a href="/api/auth/google">Google Login</a>`;
};

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

            <br> <a href="/api/exhibition">작품전시페이지</a>
            <br> <a href="/api/recruit_internship_list">채용인턴십페이지</a>
        </body>
        </html>
        `;
};

//routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/exhibition", require("./routes/exhibition"));
app.use("/api/exhibition_edit", require("./routes/exhibition_edit"));

app.use("/api/extra_review_list", require("./routes/extra_review_list"));
app.use("/api/extra_review_write", require("./routes/extra_review"));
app.use("/api/extra_review_detail", require("./routes/extra_review_detail"));

//취업 후기 글
app.use("/api/job_review_list", require("./routes/job_review_list"));
app.use("/api/job_review_write", require("./routes/job_review"));
app.use("/api/job_review_detail", require("./routes/job_review_detail"));
app.use("/api/job_review_edit", require("./routes/job_review_edit"));

//채용인턴십 글
app.use("/api/recruit_internship", require("./routes/recruit_internship"));
app.use(
  "/api/recruit_internship_list",
  require("./routes/recruit_internship_list")
);
app.use(
  "/api/recruit_internship_detail",
  require("./routes/recruit_internship_detail")
);
app.use("/api/download", require("./routes/download"));

//교육/공모전 글
app.use("/api/edu_contest_list", require("./routes/edu_contest_list"));
app.use("/api/edu_contest_write", require("./routes/edu_contest"));
app.use("/api/edu_contest_detail", require("./routes/edu_contest_detail"));
app.use("/api/edu_contest_edit", require("./routes/edu_contest_edit"));

//교육/공모전 댓글
app.use("/api/edu_cont_comment_write", require("./routes/edu_cont_comment"));

//학생회 공지 글 
app.use("/api/student_council_notice_list", require("./routes/student_council_notice_list"));
app.use("/api/student_council_notice_check", require("./routes/student_council_notice_check"));
app.use("/api/student_council_notice", require("./routes/student_council_notice"));
app.use("/api/student_council_notice_detail", require("./routes/student_council_notice_detail"));
app.use("/api/student_council_notice_edit", require("./routes/student_council_notice_edit"));

const fcm = require('firebase-admin');

let fcm_cert = require('./comhome-4cdb8-firebase-adminsdk-fa0c1-0c19882819.json')

fcm.initializeApp({ 
	credential: fcm.credential.cert(fcm_cert), 
})

app.get('/v1/push', (req, res) => {

  let deviceToken = [
      "AAAAGCBXrmQ:APA91bFupm0bghjtgzArxJ0jc-BbI93JueeSOTHN96an7-F4GX-WorM2nshEJckyM-cMNWIc3A4xp9dW5XbFWPq26CgKW8SLen4QASvS04W7nOz6CmrIwmQe1XgfMyoyRnC2m52tgIXf",
      "AAAAGCBXrmQ:APA91bE_Ew6cyu4tcC4KE3kjupc_e_sK3IysnLY3JFmPyDPqLZ6Vc43gAkLt8A_o2WcBn9Jb4TXMvNNT6e9RFqXYJrrBkc3SyjFm_Y0nda6HtKIc3QWcwyjWcnV5O4NV2XMI97GBdnV4",
      "AAAAGCBXrmQ:APA91bEyROwn63hlGrvD-sth7YFS8l-YdxfSdsGUD3Azu_anWuAvqLsuCJPWMXBPMz5SCJ5O2lEswbzgNpxSQL9l2VbRWWgjIkhrV7ag-PVGCoVGAVe5hmPGISh50JvdNTBnlOxKP8-p"
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
          console.log(response);
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

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
