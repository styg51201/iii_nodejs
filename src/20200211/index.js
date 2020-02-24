
//1. 引 入 express
const express = require('express')

const url = require('url')

//檔案系統
const fs = require('fs')

//解析POST參數
const bodyParser = require('body-parser');

//session
const session = require('express-session');

//時間格式
const moment = require('moment-timezone');

//
const multer = require('multer')

//連線資料庫
const db = require(__dirname + '/db_connect');

//爬蟲用?
const axios = require('axios');

//解壓縮用
const zlib = require('zlib');

//JQ
const cheerio = require('cheerio');

//跨網域使用
const cors = require('cors');

// 設定上傳暫存目錄
const upload = multer({ dest: 'tmp_uploads/' })

//察看電腦環境?
// console.log(process.env)

// 取得 urlencoded parser 用來解析參數用的, false =>不使用 qs lib, 而使用內建的 querystring lib
//放在中間的 
// const urlencodedParser = bodyParser.urlencoded({ extended: false });

//2. 建立 server 物件
const app = express()

const whitelist = [
    'http://localhost:63342', //phpstone
    'http://localhost:3000', //自己的主機也要加
    'http://localhost:5500',
    'http://127.0.0.1:5500', //vs code 
    undefined, // 若不是透過ajax或fatch連線 而是直接造訪 會被判斷為undefined
];

const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        // console.log('origin:', origin);
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true); // true允許拜訪
        } else {
            callback(null, false); // 不允許
        }
    }
};
//跨網域使用
app.use(cors(corsOptions));


// 註冊樣版引擎  後面是.ejs檔
app.set('view engine', 'ejs')

// top level middleware , 進到路由前就解析 
// post 傳送格式有兩種 urlencoded 和 json 
app.use(bodyParser.urlencoded({ extended: false })); //解析urlencoded格式 
app.use(bodyParser.json()); //解析json格式


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

//use => 所有的路徑及方法(get,post)都會跑進來
// 取得登入的狀態
app.use((req, res, next) => {
    //res.locals 會自動傳到temp那邊
    res.locals.isLogin = req.session.loginUser || false;
    res.locals.loginData = req.session.loginData || false;
    next(); //才會繼續往下走
})

//上傳檔案
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

        switch (req.file.mimetype) { //mimetype=>檔案類型
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
                //fs裡的rename方法=>搬移檔案 及 更改檔案名
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
                //fs.unlink => 刪除暫存的圖片
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
//     //req.body => urlencodedParser 解析參數後產生的 post的參數
//     res.json(req.body);
// });


//若使用top level middleware 則不用放中間的參數
//把填寫的資料傳到模板裡  post
app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);

});


//進入頁面 傳送模板 get
app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
});


app.get('/data-sales/1', (req, res) => {

    //require 只能讀 js 檔 或 json檔
    // 讀進來的json檔 會自動轉成物件或arr
    const data = require(__dirname + '/../../data/sales-data.json');

    //res.json() =>  把物件轉成json文字
    // res.json(data)
    res.render('sales', { data: data })
})

//TODO req.baseUrl 是什麼

//url.parse(req.url, 是否解析get的參數) => 會回傳一個obj
//url.parse 只會解析path
app.get('/try-qs/abc', (req, res) => {
    console.log(req.url); //=> try-qs/abc?name=apple
    const urlQs = url.parse(req.url, true);
    console.log('base', req.baseUrl);
    console.log('urlQs', urlQs);
    /*urlQs Url {
        protocol: null,
        slashes: null,
        auth: null,
        host: null,
        port: null,
        hostname: null,
        hash: null,
        search: '?name=apple',
        query: [Object: null prototype] { name: 'apple' },
        pathname: '/try-qs/abc',
        path: '/try-qs/abc?name=apple',
        href: '/try-qs/abc?name=apple'
    } */
    console.log('urlQs.query.name', urlQs.query.name); // => apple
    res.json(urlQs);
})

//若要整個解析網址 要用以下方式
app.get('/try-url', (req, res) => {
    //req.protocol => http or https, req.get('host') => 主機名稱+prot號
    res.write(req.protocol + '://' + req.get('host') + req.url + '\n');
    res.write(req.protocol + '\n');
    res.write(req.get('host') + '\n');
    res.write(req.url + '\n');
    res.end('');
});

//延遲5秒傳送資料
app.get('/sync-async', (req, res) => {
    setTimeout(() => {
        res.send('Hello 123');
    }, 5000);

});


//http://localhost:3000/my-params/edit/05 =>
// {"action":"edit","id":"05"} => req.params回傳一個物件
// req.params.action='edit' , req.params.id='05'(是字串)
app.get('/my-params/:action/:id', (req, res) => {
    res.json(req.params);
});


//09 前面記得要加跟目錄->\  -? => 有無- 都可以
app.get(/^\/09\d{2}-?\d{3}-?\d{3}$/, (req, res) => {
    let mobile = req.url.slice(1); //slice(idx)=> 複製開始到結束點（結束點不算）中的內容 從(1)開始是為了去掉'/'
    mobile = mobile.split('?')[0];//怕後面有帶參數 從?開始切 取第1個
    mobile = mobile.split('-').join("");
    //.join("") => 陣列每一個連接起來 可以填入要用什麼連接
    //.join('-') => 0912-345-678
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

//連接資料庫 不常用的做法?
app.get('/try-db', (req, res) => {
    const sql = "SELECT * FROM `students`";
    db.query(sql, (error, result, fields) => {
        if (!error) {
            console.log(fields) //每一欄的資訊
            res.json(result);
        } else {
            res.end(error);
        }
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

// 通訊錄
app.use('/address-book', require(__dirname + '/../routers/address-book'));

//作業
app.use('/homework', require(__dirname + '/../routers/homework'));

//時間格式
app.get('/try-moment', (req, res) => {
    //定義格式
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const m1 = moment(req.session.cookie.expires); //cookie的有效時間
    const m2 = moment(new Date());//現在的時間
    const m3 = moment('2018-9-2');//自定義時間
    const m4 = moment()//現在時間

    res.json({
        m1: m1.format(fm),
        m2: m2.format(fm),
        m3: m3.format(fm),
        m4: m4.format(fm),
        m1_: m1.tz('Europe/London').format(fm),
        m2_: m2.tz('Europe/London').format(fm),
        m3_: m3.tz('Europe/London').format(fm),
    });
});

//爬蟲
app.get('/try-axios', (req, res) => {
    axios.get('https://tw.yahoo.com/')
        .then(response => { //response 包含http的檔頭跟body
            res.end(response.data); //回傳的資料是在.data裡
        })
});

app.get('/try-bus', (req, res) => {
    axios({
        method: 'get',
        url: 'https://tcgbusfs.blob.core.windows.net/blobbus/GetBusData.gz', //資料給的是壓縮檔
        responseType: 'stream' //二維碼 (不是文字)
    })
        .then(response => {
            res.writeHead(200, {
                'Content-Type': 'text/json; charset=UTF-8'
            });
            //pipe => 給stream用的 作為流向使用?
            //zlib.createGunzip() =>　用來解壓縮的
            //pipe(res) => 流到res裡 所以要自己寫檔頭 => res.writeHead
            response.data.pipe(zlib.createGunzip()).pipe(res);
        })
});

//JQ 產生dom的原生物件
app.get('/try-cheerio', (req, res) => {
    const $ = cheerio.load('<h2>Abc<span>def</span></h2>');

    $('span').css('color', 'red');

    res.end($.html());
});

//爬YAHOO的資料抓取圖片
app.get('/try-cheerio2', (req, res) => {
    axios.get('https://tw.yahoo.com/')
        .then(response => {
            const $ = cheerio.load(response.data);//抓回來的資料變成dom的物件
            const ar = [];
            const imgs = $('img'); //選取所有圖片

            for (let i = 0; i < imgs.length; i++) {
                ar.push(imgs.eq(i).attr('src'));
            }
            //res.send( ar.join('<br>') );
            res.send(
                ar.map((el) => {
                    return `<img src="${el}"><br>`;
                }).join('')
            )
        })
});


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