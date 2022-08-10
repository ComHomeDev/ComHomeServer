const express = require('express');
const router   = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

//작품전시
// router.get('/', async (req, res) => {
//   if(req.user){
//     let data;
//     try {
//       data = await pool.query("select * from exhibition");
//       //console.log(data[0]);
//     } catch (err) {
//       console.error(err);
//       res.write('<script>window.location="/"</script>');
//     }
    
//     const temp = getPage('Comhome','exhibition-project', req.user, data[0]);
//     //console.log(temp);
//     res.send(temp);
//   }
//   else{
//     res.write(`<script type="text/javascript">alert('Please Login First !!')</script>`);
//     res.write('<script>window.location="/api/auth/login"</script>');
//   }

// });

// router.get('/post', async (req, res) => {   //이거 나중에 없애기...지금은 임시프론트땜에 get사용.
//   //const userid=req.user.id
//   const temp = postPage('exhibition-project 작품전시 작성하기');
//   res.send(temp);
// });

//이미지 업로드를 위한 multer
const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, 'uploads/')
      },
      filename: function (req, file, callback) {
        callback(null, new Date().valueOf() + path.extname(file.originalname))
      }
    }),
  });

router.post('/post', upload.single('img'), async (req, res) => {
    const userid=req.user.id;
    const exh_title=req.body.exh_title;
    const exh_content=req.body.exh_content;
    const exh_award=req.body.exh_award;
    const exh_contestName=req.body.exh_contestName;
    //8월7일 추가
    const link_github=req.body.link_github;
    const link_service=req.body.link_service;

    const exh_img = req.file == undefined ? '' : req.file.path;

    const sql = "INSERT INTO exhibition (iduser, title, content, img, award, contestName, link_github, link_service) VALUES (?, ?, ?, ?, ?, ? ,? ,?)";
    const params = [userid, exh_title, exh_content, exh_img, exh_award, exh_contestName, link_github, link_service];

    try {
        const data = await pool.query(sql,params);
        
        //알람
        //작품 전시 알람 ON한 사용자들
        const exhibition_data = await pool.query(
          `SELECT subscribe FROM subscriptions WHERE exhibition and subscribe is not null`
        );
        const message = {
          message: `작품 전시 글이 새로 올라왔습니다!`,
        };
        console.log(exhibition_data);
        exhibition_data.map((subscribe) => {
            sendNotification(JSON.parse(subscribe.subscribe), message);
        })
        res.json({data: data});
        // res.write(
        //     `<script type="text/javascript">alert('Exhibition Post Success !!')</script>`
        //   );
        // res.write(`<script>window.location="/api/exhibition"</script>`);
        // res.end();
      } catch (err) {
        // console.error(err);
        // res.write('<script>window.location="/"</script>');
      }
});

// const getPage = (title, description,auth,data)=>{
//   let htmlbody;
//   htmlbody=` <!DOCTYPE html>
//   <html lang="en">
//   <head>
//       <meta charset="UTF-8">
//       <meta http-equiv="X-UA-Compatible" content="IE=edge">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${title}</title>
//   </head>
//   <body>
//       ${auth.name} | <a href="/api/exhibition/post">작품전시작성</a>
//       <h1>${title}</h1>
//       <p>${description}</p>
//       <hr>`

//       for(let i=0; i < data.length; i++) {
//         if(auth.id==data[i].iduser){
//           htmlbody+=`
//           <form action="/api/exhibition_edit" method="post">
//           <input type="hidden" name="id" value="${data[i].no}">
//           <input type="submit" name="edit" value="수정하기">
//           </form>

//           <form action="/api/exhibition_edit/delete" method="post">
//           <input type="hidden" name="id" value="${data[i].no}">
//           <input type="submit" name="delete" value="삭제하기"
//           onClick="return confirm('Are you sure you want to delete this exhibition?')">
//           </form>`
//         }
//         htmlbody +=`<p><b>프로젝트이름: ${data[i].title}</b></p>`

//         if(data[i].award==null){
//           htmlbody+=`<p>수상경력: 없음</p>`
//         }else{htmlbody+=`<p>수상경력: ${data[i].award}</p>`}
//         if(data[i].contestName==null){
//           htmlbody+=`<p>참가대회: 없음</p>`
//         }else{
//           htmlbody+=`<p>참가대회: ${data[i].contestName}</p>` 
//         }

//         htmlbody+=`
//         <img src="${data[i].img}" />
//         <p>프로젝트 소개: ${data[i].content}</p>
//         <a href="${data[i].link_github}">깃허브 바로가기</a>
//         <a href="${data[i].link_service}">서비스 바로가기</a>
//         <hr>`;
//       }

// 	return htmlbody+`</body></html>`;
// }

// //exhibition-post 프론트 임시
// const postPage=(description)=>{
//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     </head>
//     <body>
//         <p>${description}</p>
//     <form action="/api/exhibition/post" method="post" enctype="multipart/form-data">
//     <table>
//         <tr>
//         <td>프로젝트 제목: </td>
//         <td><input type="text" name="exh_title"></td>
//         </tr>
//         <tr>
//         <td>프로젝트 소개(내용) :</td>
//         <td><textarea name="exh_content"></textarea></td>
//         </tr>
//         <tr>
//         <td>프로젝트 이미지</td>
//         <td><input type='file' name='img' accept='image/jpg, image/png, image/jpeg' /></td>
//         </tr>
//         <br>
//         <tr>
//         <td>수상경력: (없으면 빈칸) </td>
//         <td><input type="text" name="exh_award" placeholder = "ex)소웨경 금상,공모전 입상"> </td>
//         </tr>
//         <tr>
//         <td>프로젝트 참가한 대회 이름: </td>
//         <td><input type="text" name="exh_contestName" placeholder = "ex)개인프로젝트,소웨경,000공모전"></td>
//         </tr>
//         <br>

//         <td>깃허브 링크: </td>
//         <td><input type="text" name="link_github"></td>

//         <td>서비스링크: </td>
//         <td><input type="text" name="link_service"></td>

//         <tr>
//         <td><input type="submit" value="등록"></td>
//         </tr>
//     </table>
//     </form>
//     </body>
//     </html>
//     `;
// }

module.exports = router;