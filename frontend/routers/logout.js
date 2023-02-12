const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});

const { get_ip } = require('../utils/get_Ip.js');
const { query } = require('../database/postgresQL/connect.js');

router.get('/logout', urlEncoded, async(req, res) =>{
    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length === 0){
        return res.redirect("/login");
    }

    await query({
        sql: `DELETE FROM save_login WHERE ip='${await get_ip(req)}'`,
    }).then(() =>{
        res.redirect("/login");
    });
});


module.exports = router;