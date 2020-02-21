const express = require('express');
const moment = require('moment-timezone');
const db = require(__dirname + '/../20200211/db_connect');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' });
const fm = "YYYY-MM-DD"

const loginList = {
    'aaa': {
        pw: '123456',
        name: '小明'
    },
    'bbb': {
        pw: '456789',
        name: '小王'
    },
}


router.route('/edit/:id')
    .get((req, res) => {
        const sql = "SELECT * FROM `plan` WHERE id=?";
        db.queryAsync(sql, [req.params.id])
            .then(result => {
                if (!result || !result.length) {
                    res.redirect('/');
                } else {
                    result[0].startTime = moment(result[0].startTime).format(fm);
                    result[0].dueTime = moment(result[0].dueTime).format(fm);
                    res.render('homework/edit', { row: result[0] })
                }
            })
            .catch(error => {
                res.redirect('/');
            })
    })

    .post(upload.none(), (req, res) => {
        const output = {
            success: false,
            error: '',
            status: 0,
            body: req.body,
            result: {}
        };
        if (!req.body.name) {
            output.error = '請填寫名稱';
            output.status = 410;
            return res.json(output);
        }
        const sql = 'UPDATE `plan` SET `name`=?,`place`=?,`status`=?,`startTime`=?,`startTime`=? WHERE `id`=?';

        db.queryAsync(sql, [
            req.body.name,
            req.body.place,
            req.body.status,
            req.body.startTime,
            req.body.dueTime,
            req.params.id
        ])
            .then(r => {
                output.result = r;
                output.success = true;
                res.json(output);
            })
            .catch(err => {
                console.log('err', err)
                res.send(err)
            })
    });


router.route('/insert')
    .get((req, res) => {
        let today = moment(new Date()).format(fm);
        let todayAdd3 = moment(new Date()).add(3, 'days').format(fm);
        res.render('homework/insert', { today, todayAdd3 })
    })
    .post(upload.none(), (req, res) => {
        const output = {
            success: false,
            error: '',
            status: 0,
            body: req.body,
            result: {}
        };
        if (!req.body.name) {
            output.error = '請填寫名稱';
            output.status = 410;
            return res.json(output);
        }

        const sql = 'INSERT INTO `plan` (`name`,`place`,`status`,`startTime`,`dueTime`) VALUE (?,?,?,?,?)'
        db.queryAsync(sql, [
            req.body.name,
            req.body.place,
            req.body.status,
            req.body.startTime,
            req.body.dueTime
        ])
            .then(r => {
                output.result = r;
                output.success = true;
                res.json(output);
            })
            .catch(err => {
                console.log('err', err)
                res.send(err)
            })
    })

router.post('/delete/:id', (req, res) => {
    const output = {
        success: false,
        error: '',
        status: 0,
        body: req.body,
        result: {}
    };
    const sql = "DELETE FROM `plan` WHERE `id`=?";
    db.queryAsync(sql, [req.params.id])
        .then(r => {
            output.result = r
            output.success = true
            res.json(output)
        })
        .catch(err => {
            console.log('err', err)
            res.send(err)
        })
})

router.get('/list/:page?', (req, res) => {
    const perPage = 5;
    let totalRows, totalPages;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    const t_sql = "SELECT COUNT(1) num FROM `plan`";
    db.queryAsync(t_sql)
        .then(result => {
            totalRows = result[0].num; // 總筆數
            totalPages = Math.ceil(totalRows / perPage);//無條件進位

            // 限定 page 範圍
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            const sql = `SELECT * FROM plan LIMIT  ${(page - 1) * perPage}, ${perPage}`;

            return db.queryAsync(sql)
        })
        .then(result => {

            //轉日期文字格式
            result.forEach((row) => {
                row.startTime = moment(row.startTime).format(fm)
                row.dueTime = moment(row.dueTime).format(fm)
            })

            res.render('homework/hwList', {
                totalRows,
                totalPages,
                page,
                rows: result
            })
        })
})


router.route('/')
    .get((req, res) => {
        res.render('homework/home')
    })
    .post((req, res) => {
        if (req.body.user && req.body.password) {
            if (loginList[req.body.user] && req.body.password === loginList[req.body.user].pw) {

                req.session.loginUser = req.body.user;
                req.session.loginData = Location[req.body.user];

                return res.json({
                    success: true,
                    msg: '登入失敗',
                    body: req.body
                });
            }
        }
        res.json({
            success: false,
            msg: '登入失敗',
            body: req.body
        })
    })

module.exports = router;