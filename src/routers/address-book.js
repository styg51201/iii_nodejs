const express = require('express');
const moment = require('moment-timezone');
const db = require(__dirname + '/../20200211/db_connect');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' });
const fm = "YYYY-MM-DD"

//舊寫法
router.get('/list-old/:page?', (req, res) => {
    const perPage = 5;
    let totalRows, totalPages;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    const t_sql = "SELECT COUNT(1) num FROM `students`";
    db.query(t_sql, (error, result) => {
        totalRows = result[0].num; // 總筆數
        totalPages = Math.ceil(totalRows / perPage);

        // 限定 page 範圍
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const sql = `SELECT * FROM students LIMIT  ${(page - 1) * perPage}, ${perPage}`;
        db.query(sql, (error, result) => {

            //轉日期文字格式
            const fm = "YYYY-MM-DD"
            result.forEach((row, idx) => {
                row.studentBirthday = moment(row.studentBirthday).format(fm)
            })

            res.render('adress-book/list', {
                totalRows,
                totalPages,
                page,
                rows: result
            })

        });
    });
});

//.then的寫法
router.get('/list/:page?', (req, res) => {
    const perPage = 5;
    let totalRows, totalPages;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    const t_sql = "SELECT COUNT(1) num FROM `students`";
    db.queryAsync(t_sql)
        .then(result => {
            totalRows = result[0].num; // 總筆數
            totalPages = Math.ceil(totalRows / perPage);

            // 限定 page 範圍
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            const sql = `SELECT * FROM students LIMIT  ${(page - 1) * perPage}, ${perPage}`;

            return db.queryAsync(sql)
        })
        .then(result => {
            //轉日期文字格式

            result.forEach((row, idx) => {
                row.studentBirthday = moment(row.studentBirthday).format(fm)
            })

            res.render('address-book/list', {
                totalRows,
                totalPages,
                page,
                rows: result
            })
        })
})

router.get('/insert', (req, res) => {
    res.render('address-book/insert');
})

//前端沒有上傳檔案,所以用none()的方式
router.post('/insert', upload.none(), (req, res) => {

    const output = {
        success: false,
        error: '',
        status: 0,
        body: req.body,
        result: {}
    };

    if (!req.body.name || req.body.name.length < 2) {
        output.error = '請填寫正確的姓名';
        output.status = 410; //自訂 (400是http用戶端的錯誤)
        return res.json(output);
    }

    if (!req.body.birthday || ! /^\d{4}-\d{1,2}-\d{1,2}/.test(req.body.birthday)) {
        output.error = '請填寫合法的生日';
        output.status = 430;
        return res.json(output);
    }



    const sql = `INSERT INTO \`students\`(\`studentName\`, \`studentGender\`, \`studentBirthday\`, \`studentPhoneNumber\`, \`studentDescription\` ) 
VALUES (?, ?, ?, ?, ?)`;

    db.queryAsync(sql, [
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.mobile,
        req.body.desc,
    ])
        .then(r => {
            output.result = r;
            output.success = true;
            console.log('result', r)
            res.json(output);
        })
        .catch(err => {
            console.log('err', err)
            res.send(err)
        })
});

router.post('/del/:sid', (req, res) => {
    const sql = "DELETE FROM `students` WHERE `id`=?";
    db.queryAsync(sql, [req.params.sid])
        .then(r => {
            console.log(r);
            res.json(r);
        })
});

router.get('/edit/:sid', (req, res) => {
    const sql = "SELECT * FROM `students` WHERE id=?";
    db.queryAsync(sql, [req.params.sid])
        .then(result => {
            if (!result || !result.length) {
                res.redirect(req.baseUrl + '/list');
            } else {
                result[0].studentBirthday = moment(result[0].studentBirthday).format(fm)
                res.render('address-book/edit', { row: result[0] });
            }
        })
        .catch(error => {
            res.redirect(req.baseUrl + '/list');
        })
});

router.post('/edit/:sid', upload.none(), (req, res) => {

    const output = {
        success: false,
        error: '',
        status: 0,
        body: req.body,
        result: {}
    };

    if (!req.body.name || req.body.name.length < 2) {
        output.error = '請填寫正確的姓名';
        output.status = 410; //自訂 (400是http用戶端的錯誤)
        return res.json(output);
    }

    if (!req.body.birthday || ! /^\d{4}-\d{1,2}-\d{1,2}/.test(req.body.birthday)) {
        output.error = '請填寫合法的生日';
        output.status = 430;
        return res.json(output);
    }


    const sql = 'UPDATE `students` SET `studentName`=?,`studentGender`=?,`studentBirthday`=?,`studentPhoneNumber`=?,`studentDescription`=? WHERE `id`=?';

    db.queryAsync(sql, [
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.mobile,
        req.body.desc,
        req.params.sid
    ])
        .then(r => {
            output.result = r;
            output.success = true;
            console.log('result', r)
            res.json(output);
        })
        .catch(err => {
            console.log('err', err)
            res.send(err)
        })
});

router.get('/list-api', (req, res) => {
    const perPage = 5;
    let totalRows, totalPages;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    const t_sql = "SELECT COUNT(1) num FROM `students`";
    db.queryAsync(t_sql)
        .then(result => {
            totalRows = result[0].num; // 總筆數
            totalPages = Math.ceil(totalRows / perPage);

            // 限定 page 範圍
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            const sql = `SELECT * FROM students LIMIT  ${(page - 1) * perPage}, ${perPage}`;

            return db.queryAsync(sql)
        })
        .then(result => {
            //轉日期文字格式

            result.forEach((row, idx) => {
                row.studentBirthday = moment(row.studentBirthday).format(fm)
            })

            res.json({
                totalRows,
                totalPages,
                page,
                rows: result
            })
        })
})


/*result {
  fieldCount: 0,
  affectedRows: 1, 影響的列數
  insertId: 26, 新增的id
  serverStatus: 2,
  warningCount: 2,
  message: '',
  protocol41: true,
  changedRows: 0 更改的列數
}
 */

// res.end(num.toString()); //end() 數值要轉字串
// CRUD

/*
R
/list
/list/:page?
C
/insert -get
/insert -post
U
/edit/:sid -get
/edit/:sid -post
D
/del -get (post)
 
 */




module.exports = router;