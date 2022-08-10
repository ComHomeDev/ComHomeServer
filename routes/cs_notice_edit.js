const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const templates = require("../lib/templates");
const multer = require('multer');
const path = require('path');

//채용인턴십 글 수정하기
router.post("/", async (req, res) => {

    //console.log(req.body);
    const data = await pool.query(`SELECT * FROM cs_notice where no =${req.body.id}`);
    console.log(data[0][0]);

    const title = "학과공지글 수정";
    const head = ``;
    let body = `
    <form action="/api/cs_notice_edit/update" method ="post" accept-charset="UTF-8">
    <b>학과공지글 작성</b>
    <br>
    <label> 제목: 
      <input type = "text" name = "title" value="${data[0][0].title}"/> </label>
      <br>
      <br>
      <label> 내용: 
      <textarea name="content">${data[0][0].content}</textarea></label>
      <br>
      `
      if(data[0][0].img !=''){
        body+=`
        <script type="text/javascript">
            function div_hide() {
                document.getElementById("showImage").style.display = "none";
                document.getElementById("deleteBtn").style.display = "none";
                document.getElementById("addImage").style.display = "block";}
        </script>

        <p>학과공지 이미지</p>
        <img id='showImage' src="${data[0][0].img}"/>
        <input type="button" id="deleteBtn" value="X(이미지삭제)" onclick="div_hide();"/>
        <input style="display:none;" type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg'/>
        `
    }else{
        body+=`
        <td>학과공지 이미지</td>
        <td><input type='file' id='addImage' name='img' accept='image/jpg, image/png, image/jpeg' /></td>
        </tr>`
    }
    body+= `
      <input type="hidden" name="id" value="${data[0][0].no}">
      <input type="submit" value="수정">
      
      </form>
    `;
  
    var html = templates.HTML(title, head, body);
    res.send(html);
  }); 

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

const fileFields = upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 8 },
])

//수정한 글 db에 저장
  router.post("/update", fileFields, async (req, res) => {

    console.log("공지번호");
    const notice_id=Number(req.body.id);
    const edit = req.body;
    console.log(edit);
    const date=new Date();
    const title = edit.notice_title;
    const cont = edit.notice_cont;
    //const notice_id=edit.notice_id;
    console.log(notice_id);
    const notice_img = req.files.img == undefined ? '' : req.files.img[0].path;
    //const notice_file = req.files.file == undefined ? '' : req.files.file[0].path;

    //const exh_img = req.file == undefined ? '' : req.file.path;

    const sql1 = "UPDATE cs_notice SET title=?, content=?, edited_date=?, img=? WHERE no=?";
    const params1 = [title, cont, date, notice_img, notice_id];

    //수정할때 이미지 추가 안한경우에는 update문에서 img 속성은 빼야함
    const sql2 = "UPDATE cs_notice SET title=?, content=?, edited_date=? WHERE no=?";
    const params2 = [title, cont, date, notice_id];

    //이미지 없으면 sql2 쿼리, 이미지 있으면 sql1 쿼리
    let sql=req.file==undefined? sql2 : sql1;
    let params=req.file==undefined? params2 : params1;

    //console.log('74행');

    //const sql=`UPDATE recruit_intern SET not_title=?, not_content=?, not_edited_date=? WHERE no=?`
   // const params=[title, cont, date, notice_id];

    try {
        const data = await pool.query(sql,params);
        //console.log(data);
        
        //학과 공지 알람 ON한 사용자들
        const cs_data = await pool.query(
          `SELECT subscribe FROM subscriptions WHERE cs_notice and subscribe is not null`
        );
        
        const message = {
          message: `학과 공지 글이 수정되었습니다!`,
        };
        console.log(cs_data);
        cs_data.map((subscribe) => {
            sendNotification(JSON.parse(subscribe.subscribe), message);
        })

        res.write(`<script type="text/javascript">alert('CS notice Edit Success !!')</script>`);
        res.write(`<script>window.location="/api/cs_notice_list"</script>`);
        res.end();
    } catch (err) {
        console.error(err);
        res.write('<script>window.location="/"</script>');
    }

    //첨부파일 수정-->> 여러개 table에 저장 (추후 구현예정)
    /*
    for(let i=0;i<count;i++){
      try {
        const data = await pool.query(`INSERT INTO file_intern(notice_id, file_infoN, file_originN) VALUES(?,?,?)`,[notice_id, req.files.file[i].path, req.files.file[i].originalname]);
      } catch (err) {
        console.error(err);
      }
    }
    */
  });

  //채용인턴십 글 삭제하기
  router.post("/delete", async (req, res) => {
    const notice_id=Number(req.body.id);
    const file_status=await pool.query(`SELECT file_status FROM cs_notice WHERE no=${notice_id}`);

    if(file_status[0][0].not_file_status==1){
      //console.log('첨부파일 존재함.->삭제하기');
      const data = await pool.query(`DELETE FROM file_cs WHERE no=?`,[notice_id]);
    }

    const sql = `DELETE FROM cs_notice WHERE no=?`;
    try {
        const data = await pool.query(sql,[notice_id]);
        res.write(
            `<script type="text/javascript">alert('CS notice Delete Success !!')</script>`
          );
        res.write(`<script>window.location="/api/cs_notice_list"</script>`);
        res.end();
      } catch (err) {
        console.error(err);
        res.write('<script>window.location="/"</script>');
      }
  });


  
  module.exports = router;