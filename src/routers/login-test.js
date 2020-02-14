const express = require('express');
const router = express.Router();

const loginList = {
    'shin': {
        pw: '123456',
        nickname: 'Shin'
    },
    'shinder': {
        pw: '777777',
        nickname: '哈哈'
    },
};

router.get('/login', (req, res) => {
    res.render('login-test-login');
});

router.post('/login', (req, res) => {
    if (req.body.user && req.body.password) {
        if (loginList[req.body.user] && req.body.password === loginList[req.body.user].pw) {
            res.json({
                msg: '可登入',
                body: req.body
            });
            return;
        }
    }
    res.json({
        msg: '不可以',
        body: req.body
    });
});

router.get('/logout', (req, res) => {

});

module.exports = router;