const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {

    //(檔案路徑 ,  執行後的function err=>若無誤是空值 , data=>讀取的資料(整個html))
    fs.readFile(__dirname + '/read.html', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - \n error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    })
})

server.listen(3000);