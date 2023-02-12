const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});

const { get_ip } = require('../utils/get_Ip.js');
const { query } = require('../database/postgresQL/connect.js');

router.get('/register', urlEncoded, async(req, res) =>{
    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length > 0){
        return res.redirect("/upload");
    }

    res.render("register.ejs", {
        error: null,
    });
});

router.post('/register', urlEncoded, async(req, res) =>{

    const { email, username, password } = req.body ?? {};

    if(typeof username === "undefined" || typeof password === "undefined" || typeof email === "undefined"){
        return res.redirect("/register");
    }

    const checkData = await query({
        sql: `SELECT * FROM users WHERE email='${email}' OR username='${username}'`,
    });
    if(checkData.result.rows.length > 0){
        return res.render('register.ejs', {
            error: `Email หรือ Username นี้ได้ถูกใช้ไปเเล้ว`,
        });
    }

    await query({
        sql: `INSERT INTO users(username,password,email) VALUES('${username}','${password}','${email}')`,
    }).then(() =>{
        res.redirect("/login");
    });
});

module.exports = router;