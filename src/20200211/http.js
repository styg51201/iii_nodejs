//require('放js檔或node的方法')
const http = require('http');
const { Person } = require('./person')

const p1 = new Person('Jane', 30)

const server = http.createServer((req, res) => {
    //標頭
    //200=>http狀態代碼
    //回傳格式 是json 就改json
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    //req.url => 請求方的網址 路徑
    res.end(`<h2>Hello!12</h2>
            <p>${req.url}</p>
            <p>${p1.toJson()}</p>`)
})


//prot 號 =3000
//開發中不要用1024以下

server.listen(3000);