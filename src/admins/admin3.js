const express = require('express');
const router = express.Router();

// router.route('路徑') => 先設定哪個路由
router.route('/member/edit/:id?')
    //再定義是哪個方法進來的
    //.all 全部都會進  => 通常放前面
    .all((req, res, next) => {
        console.log('All');
        res.locals.shin = 'der';
        next(); //一定要next() 才會繼續往下走
    })

    .get((req, res) => {
        res.send('GET: ' + req.url + `: ${res.locals.shin}`);
    })
    .post((req, res) => {
        res.send('POST: ' + req.url + `: ${res.locals.shin}`);
    });
module.exports = router;