const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});

const { get_ip } = require('../utils/get_Ip.js');
const { query } = require('../database/postgresQL/connect.js');

router.get('/login', urlEncoded, async(req, res) =>{
    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length > 0){
        return res.redirect("/upload");
    }

    res.render("login.ejs", {
        error: null,
    });
});

router.post('/login', urlEncoded, async(req, res) =>{

    const { username, password } = req.body ?? {};

    if(typeof username === "undefined" || typeof password === "undefined"){
        return res.redirect("/login");
    }

    const auth = await query({
        sql: `SELECT password FROM users WHERE username='${username}'`,
    });
    if(auth.result.rows.length === 0){
        return res.render('login.ejs', {
            error: `ไม่พบ Username นี้`,
        });
    }
    if(auth.result.rows[0].password !== password){
        return res.render('login.ejs', {
            error: `Password ไม่ถูกต้อง`,
        });
    }

    const getDate = new Date().getTime()
    await query({
        sql: `INSERT INTO save_login(ip,username,timestamp) VALUES('${await get_ip(req)}','${username}','${getDate}')`,
    }).then(() =>{
        res.redirect("/upload");
    });
});

module.exports = router;