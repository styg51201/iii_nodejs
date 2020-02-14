const express = require('express');
//與 index.js require 的 是同一個express 同一個參照
const router = express.Router();

console.log(express.shinderVar);

router.get('/admin2/:p3?/:p4?', (req, res) => {
    res.json(req.params);
});

module.exports = router;