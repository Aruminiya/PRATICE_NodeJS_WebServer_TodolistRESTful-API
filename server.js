const http = require("http");
const { v4: uuidv4 } = require('uuid');
const todos = [];
const errorHandle = require('./erroeHandle.js')

const requestListener = (req, res) => {
  // console.log(req.url);
  // console.log(req.method);
  // 設定首頁路徑

  const headers = {
    // 允許的請求標頭
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    // 允許的來源（此處為所有來源，請謹慎使用）
    'Access-Control-Allow-Origin': '*',
    // 允許的請求方法
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    // Content-Type 標頭指示請求/回應的媒體類型
    'Content-Type': 'application/json'
  }
  // 取得待辦事項
  if (req.url==="/todos" && req.method === "GET"){
    res.writeHead(200, headers);
    // 網路請求只看得懂字串
    res.write(JSON.stringify({
      "status":"success",
      "data": todos,
      
    }));
    res.end();
  }
  // 新增待辦事項
  else if (req.url==="/todos" && req.method === "POST") {
    let body = ""
    req.on("data", (chunk)=>{
      // console.log(chunk);
      body+=chunk
    })
    req.on("end",()=>{
      try { 
        let postData = JSON.parse(body);
        const title = postData.title;
        postData.id = uuidv4();
        // console.log(postData);
        if(title !== undefined){
          todos.push(postData)
        res.writeHead(200, headers);
        res.write(JSON.stringify({
        "status":"success",
        "data": todos[todos.length-1],
        }));
        res.end();
        }else{
          errorHandle(res,"資料格式有誤","資料格式有誤");
        }
        
       }
      catch(err) {
        errorHandle(res,"新增資料失敗",err);
      }
    })
  }
  // 刪除全部待辦事項
  else if (req.url==="/todos" && req.method === "DELETE"){
    try{
      todos.length = 0;

      res.writeHead(200, headers);
      // 網路請求只看得懂字串
      res.write(JSON.stringify({
        "status":"success",
        "data": todos,
        "response" : "已刪除全部待辦事項"
        
      }));
      res.end();
    
    }catch(err){
      errorHandle(res,"刪除全部待辦事項失敗",err);
    };
    
  }
  // 刪除單筆待辦事項
  else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    try{
      const urlParts = req.url.split("/");
      const id = urlParts[2]; 
      const deleteIndex = todos.findIndex((e)=>e.id == id);
        if(deleteIndex !==-1 ){       
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          "status":"success",
          "data": todos[deleteIndex],
          "response" : "已刪除單筆待辦事項"
          
        }));
        todos.splice(deleteIndex,1);
        res.end();
      }else{
        errorHandle(res,"刪除單筆待辦事項 ID 有誤","刪除單筆待辦事項 ID 有誤");
      }
      
    }catch(err){
      errorHandle(res,"刪除單筆待辦事項失敗",err);
    }
  }
  // 編輯待辦事項
  else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
    let body = ""
    req.on("data", (chunk)=>{
      // console.log(chunk);
      body+=chunk
    })
    req.on("end",()=>{
      try {
        const urlParts = req.url.split("/");
        const id = urlParts[2]; 
        const editIndex = todos.findIndex((e)=>e.id == id);

        let postData = JSON.parse(body);
        const title = postData.title;
        
        
        // console.log(postData);
        if(title !== undefined && editIndex !==-1){
          todos[editIndex].title = title
          res.writeHead(200, headers);
          res.write(JSON.stringify({
          "status":"success",
          "data": todos[editIndex],
          }));
          res.end();
        }else{
            errorHandle(res,"資料格式有誤","資料格式有誤");
        }
        
       }
      catch(err) {
        errorHandle(res,"編輯資料失敗",err);
      }
    })
  }
  // 給 preflight options API 檢查機制 用
  else if (req.url==="/" && req.method === "OPTIONS"){
    res.writeHead(200, headers);
    res.end();
  }else{
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status":"error",
      "message": "無此網路路由",
    }));
    res.end();
  }
  
};

const server = http.createServer(requestListener);
server.listen(3005);
