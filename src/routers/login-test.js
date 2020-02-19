const express = require('express');
const router = express.Router();

const loginList = {
    'shin': {
        pw: '123456',
        nickname: '444'
    },
    'shinder': {
        pw: '777777',
        nickname: '哈哈'
    },
};

// 權限判斷
router.use((req, res, next) => {
    if (!req.session.loginUser) {
        //不用權限的頁面跳過 可以做成一個arr
        if (req.url === '/login') {
            next();
        } else {
            res.send('<h2>您沒有權限</h2><a href="./login">登入</a>');
        }
    } else {
        next();
    }
});




router.get('/login', (req, res) => {
    const login = {
        loginData: req.session.loginData || false
    }
    res.render('login-test-login', login);
});

router.post('/login', (req, res) => {
    if (req.body.user && req.body.password) {
        if (loginList[req.body.user] && req.body.password === loginList[req.body.user].pw) {

            req.session.loginUser = req.body.user;
            req.session.loginData = loginList[req.body.user];

            return res.json({
                success: true,
                msg: '可登入',
                body: req.body
            });

        }
    }
    res.json({
        success: false,
        msg: '不可以',
        body: req.body
    });
});


// 權限判斷 放在需要權限的前面
router.use((req, res, next) => {
    if (!req.session.loginUser) {
        res.send('<h2>您沒有權限</h2><a href="./login">登入</a>');

    } else {
        next();
    }
});


router.get('/sess', (req, res) => {
    res.json(req.session)
});

router.get('/logout', (req, res) => {
    delete req.session.loginUser
    delete req.session.loginData
    res.redirect(req.baseUrl + '/login')

});

module.exports = router;