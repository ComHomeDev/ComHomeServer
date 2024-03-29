const port = 5000;
const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const pool = require("./db.js");
const {publicKey, sendNotification} = require("./routes/push");

app.use(cors());
app.use(session({secret: "MySecret", resave: false, saveUninitialized: true}));

//소켓
const http = require('http');
const server = http.createServer(app);
//const io = require('socket.io')(server);
  
const io = require('socket.io')(server,{
  cors : {
      origin :"http://localhost:3000",
      credentials :true
  }
});

// Passport setting
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/uploads", express.static(__dirname + "/uploads"));

//홈페이지 생성 (req.user는 passport의 serialize를 통해 user 정보 저장되어있음)
app.get("/api", async (req, res) => {
  const temp = getPage("Welcome", "Welcome to visit...", getBtn(req.user));
  const iduser = req.query.iduser;
  //로그인 시 사용자 구독정보 전송
  if (iduser != undefined) {
    const [data] = await pool.query(
      `SELECT recruit_intern, exhibition, student_council_notice, job_review, edu_contest, cs_notice, extra_review FROM subscriptions where iduser = ${iduser}`
    );
    res.json({data: data});
  } else {
    // res.json({message : '400 Bad Request'});
    res.send(temp);
  }
});

//프론트 임시로->url 바로 들어가도 된다.
const getBtn = (user) => {
  return user !== undefined
    ? `${user.name} | <a href="/api/auth/logout">logout</a> <br><br> 
    <a href = "/api/extra_review_list">대외활동 후기 바로가기</a> <br><br> 
    <a href = "/api/job_review_list">취업 후기 바로가기</a> <br><br> 
    <a href = "/api/edu_contest_list">교육/공모전 글 바로가기</a> <br><br> 
    <a href = "/api/student_council_notice_list">학생회 공지</a> <br><br>
    <a href = "/api/chat">선배와 채팅하기</a> <br><br>
    <a href = "/api/graduate_interview_list">졸업생 인터뷰(선배들list)</a> <br><br>
    `    : `<a href="/api/auth/google">Google Login</a>`;
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
            <br> <a href="/api/recruit_intern_list">채용인턴십페이지</a>
        </body>
        </html>
      `;
};

//routes
app.use("/api/auth", require("./routes/auth"));

//작품 전시글
app.use("/api/exhibition", require("./routes/exhibition"));
app.use("/api/exhibition_edit", require("./routes/exhibition_edit"));

//학과공지 글
app.use("/api/cs_notice_list", require("./routes/cs_notice_list"));
app.use("/api/cs_notice", require("./routes/cs_notice"));
app.use("/api/cs_notice_detail", require("./routes/cs_notice_detail"));
app.use("/api/cs_notice_edit", require("./routes/cs_notice_edit"));

//대외활동 후기 글
app.use("/api/extra_review_list", require("./routes/extra_review_list"));
app.use("/api/extra_review", require("./routes/extra_review"));
app.use("/api/extra_review_detail", require("./routes/extra_review_detail"));
app.use("/api/extra_review_edit", require("./routes/extra_review_edit"));

//취업 후기 글
app.use("/api/job_review_list", require("./routes/job_review_list"));
app.use("/api/job_review", require("./routes/job_review"));
app.use("/api/job_review_detail", require("./routes/job_review_detail"));
app.use("/api/job_review_edit", require("./routes/job_review_edit"));

//채용인턴십 글
app.use("/api/recruit_intern", require("./routes/recruit_internship"));
app.use(
  "/api/recruit_intern_list",
  require("./routes/recruit_internship_list")
);
app.use(
  "/api/recruit_intern_detail",
  require("./routes/recruit_internship_detail")
);
app.use(
  "/api/recruit_intern_edit",
  require("./routes/recruit_internship_edit")
);
app.use("/api/download", require("./routes/download"));

//교육/공모전 글
app.use("/api/edu_contest_list", require("./routes/edu_contest_list"));
app.use("/api/edu_contest", require("./routes/edu_contest"));
app.use("/api/edu_contest_detail", require("./routes/edu_contest_detail"));
app.use("/api/edu_contest_edit", require("./routes/edu_contest_edit"));

//교육/공모전 댓글
app.use("/api/edu_contest_comment", require("./routes/edu_cont_comment"));
app.use("/api/edu_contest_comment_edit", require("./routes/edu_contest_comment_edit"));

//스크랩
app.use("/api/scrap", require("./routes/scrap"));

//마이페이지
app.use("/api/mypage", require("./routes/mypage"));

//알림
app.get("/api/publicKey", (_req, res) => {
  res.send(publicKey);
});
app.use("/api/pushSubscription", require("./routes/pushSubscription"));

//학생회 공지 글
app.use("/api/student_council_notice_list", require("./routes/student_council_notice_list"));
app.use("/api/student_council_notice", require("./routes/student_council_notice"));
app.use("/api/student_council_notice_detail", require("./routes/student_council_notice_detail"));
app.use("/api/student_council_notice_edit",require("./routes/student_council_notice_edit"));


//졸업생 인터뷰(채팅)
app.use("/api/graduate_interview", require("./routes/graduate_interview"));
app.use("/api/graduate_interview_list", require("./routes/graduate_interview_list"));
app.use("/api/chat", require("./routes/chat_bubble")); //버블(단체) 채팅

io.on('connection', (socket)=>{
  // 채팅방에 채팅 요청
  socket.on('req_room_message', (roomnum, sender, msg) => {     //client > server
      console.log(roomnum, sender);
      console.log("메시지:"+ msg);
      io.emit('noti_room_message', {roomnum, sender, msg} );  // server > client (내가 client로 보내주는)

      const sql="INSERT INTO b_chat (roomid, senderid, message, date) VALUES(?,?,?,?)";
      const params=[roomnum, sender, msg, new Date()];
      try{
        const data= pool.query(sql,params);
      } catch(err){
        console.error(err);
      }

  });

  socket.on('disconnect', async () => {
      console.log('user disconnected');
  });
});


server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});