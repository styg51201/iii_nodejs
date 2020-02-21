const mysql = require('mysql');
const bluebird = require('bluebird');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'address_book'
});
db.connect(); // 連 線

//node 的事件監聽 
db.on('error', (event) => {
    console.log(event);
});


bluebird.promisifyAll(db);

module.exports = db;
