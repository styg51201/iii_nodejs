
//1. 引 入 express
const express = require('express')
const url = require('url')
const fs = require('fs')
const bodyParser = require('body-parser');

const session = require('express-session');

const multer = require('multer')

// 設定上傳暫存目錄
const upload = multer({ dest: 'tmp_uploads/' })


// 取得 urlencoded parser 用來解析參數用的, false =>不使用 qs lib, 而使用內建的 querystring lib
//放在中間的 
// const urlencodedParser = bodyParser.urlencoded({ extended: false });

//2. 建立 server 物件
const app = express()

// 註冊樣版引擎  後面是.ejs檔
app.set('view engine', 'ejs')

// top level middleware , 進到路由前就解析 
app.use(bodyParser.urlencoded({ extended: false }));
// 兩種解析功能： urlencoded 和 json , 資料是json就會用這個middleware 解析
app.use(bodyParser.json());

//設定session
app.use(session({
    // 新用戶沒有使用到 session 物件時不會建立 session 和發送 cookie
    saveUninitialized: false,
    resave: false, // 沒變更內容是否強制回存
    secret: 'skdfjhdksfj', //加密用的字串 隨便打
    cookie: {
        maxAge: 1200000 //// 存活時間20分鐘，單位毫秒
    }
}));

//upload.single('前端input名') single=>只有一個檔案
app.post('/try-upload', upload.single('avatar'), (req, res) => {
    console.log(req.file)

    const output = {
        success: false,
        url: '',
        msg: '沒有上傳檔案',
    };

    //確認上傳檔案 跟 上傳檔案原始名 是否存在
    if (req.file && req.file.originalname) {

        switch (req.file.mimetype) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
                //rename 搬移檔案 及 更改檔案名
                fs.rename(req.file.path, './public/img/' + req.file.originalname, error => {
                    //有誤的話
                    if (error) {
                        output.success = false;
                        output.msg = '無法搬動檔案';
                    } else {
                        output.success = true;
                        output.url = '/img/' + req.file.originalname;
                        output.msg = '';
                    }
                    res.json(output);
                });

                break;

            default:
                fs.unlink(req.file.path, error => {
                    output.msg = '不接受式這種檔案格';
                    res.json(output);
                });
        }

    } else {
        res.json(output);
    }

})


// 3. 路由
// app.get( 從哪個路徑進來 , 執行函式)
app.get('/', (req, res) => {

    //回傳資訊 .send => html用
    // res.send('由根目錄進來的')

    //回傳資訊 .render => 樣板用
    //只能放一個 obj
    //('樣板檔案名', { obj })
    res.render('home', { name: '世界', age: 2020 })

})

// 把 urlencodedParser 當 middleware => 解析post的參數
// app.post('/try-post-form', urlencodedParser, (req, res) => {
//     //req.body => rlencodedParser 解析參數後產生的 
//     res.json(req.body);
// });


//進入頁面 傳送模板 get
app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
});


//若使用top level middleware 則不用放中間的參數
//把填寫的資料傳到模板裡  post
app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);

});


app.get('/data-sales/1', (req, res) => {

    //require 只能讀 js 檔 或 json檔
    // 讀進來的json檔 會自動轉成物件或arr
    const data = require(__dirname + '/../../data/sales-data.json');

    //res.json() =>  把物件轉成json文字
    // res.json(data)

    res.render('sales', { data: data })
})

// url.parse(req.url, 是否解析get的參數) => 會回傳一個obj
//url.parse 只會解析path
app.get('/try-qs', (req, res) => {
    const urlQs = url.parse(req.url, true);
    console.log(urlQs);
    console.log(urlQs.query.name);
    res.json(urlQs);
})

//若要整個解析網址 要用以下方式
app.get('/try-url', (req, res) => {
    res.write(req.protocol + '://' + req.get('host') + req.url + '\n');
    res.write(req.protocol + '\n');
    res.write(req.get('host') + '\n');
    res.write(req.url + '\n');
    res.end('');
});

app.get('/sync-async', (req, res) => {
    setTimeout(() => {
        res.send('Hello 123');
    }, 5000);

});

app.get('/my-params/:action/:id', (req, res) => {
    res.json(req.params);
});
//http://localhost:3000/my-params/edit/05 =>
// {"action":"edit","id":"05"} => req.params回傳一個物件

//09 前面記得要加跟目錄->\  -? => 有無- 都可以
app.get(/^\/09\d{2}-?\d{3}-?\d{3}$/, (req, res) => {
    let mobile = req.url.slice(1);
    mobile = mobile.split('?')[0];
    mobile = mobile.split('-').join("");
    //.join("") => 陣列每一個連接起來 可以填入要用什麼連接
    res.json(mobile);
});


//session
app.get('/try-session', (req, res) => {
    console.log(req.session);
    //my_var有的話=my_var 沒有=0
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session
    });
});



app.get('/abc', (req, res) => {
    res.send('由/abc進來的')
})

app.get('/abc/123', (req, res) => {
    res.send('由/abc/123進來的')
})
//方法1.路由從外面引進 => 通常不這樣用
const admin1fn = require(__dirname + '/../admins/admin1');
admin1fn(app);

//方法2.
const admin2Router = require(__dirname + '/../admins/admin2')
app.use(admin2Router);

//方法3.
app.use('/admin3/', require(__dirname + '/../admins/admin3'));

//登入測試
app.use('/login-test', require(__dirname + '/../routers/login-test'));


//靜態內容資料夾
//http://localhost:3000/a.html 路徑裡 不用加public
app.use(express.static(__dirname + '/../../public'));


//404頁面
//use => 所有的路徑及方法(get,post)都會跑進來
//要放在所有路由的最後面
app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - 找不到網頁');
});


// 4. Server 偵 聽
//啟動時執行的 function => console.log('start express')
app.listen(3000, () => {
    console.log('start express')
})