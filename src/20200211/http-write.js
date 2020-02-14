const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
    //__dirname => 此檔所在的位置 nodeJs/src/http-2.js
    //(檔案路徑 , 讀寫資料 , 執行後的function err=>若無誤是空值)
    fs.writeFile(__dirname + '/header.json', JSON.stringify(req.headers), (err) => {
        if (err) {
            res.end(err)
        } else {
            res.end('<h1>OK</h1>')
        }
    })
})

server.listen(3000);