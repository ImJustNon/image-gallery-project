const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});
const request = require('request');

const { get_ip } = require('../utils/get_Ip.js');
const { query } = require('../database/postgresQL/connect.js');
const config = require('../configs/config.js');

router.get('/upload', urlEncoded, async(req, res) =>{

    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length === 0){
        return res.redirect("/login");
    }
    
    res.render("index.ejs", {
        title: "UPLOAD",
        error: null,
        data: {

        },
    });
});

router.post('/upload/submit', urlEncoded, async(req, res) =>{
    const { originalName, base64 } = req.body ?? {};
    if(typeof originalName === "undefined" || typeof base64 === "undefined"){
        return res.json({
            status: "FAIL",
            error: "Some information missing",
        });
    }

    const getUserData = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });

    const options = {
        uri: `${config.api.server}/api/upload-image`,
        method: 'POST',
        json: {
          "file": `${base64}`,
          "originalFileName": `${originalName}`,
        }
    }

    try {
        request(options, async(error, response, body) =>{
            if(await error){
                return res.json({
                    status: "FAIL",
                    error: error,
                });
            }
            if(await response.body.status === "FAIL"){
                return res.json({
                    status: "FAIL",
                    error: await response.body.error,
                });
            }

            await query({
                sql: `INSERT INTO user_data(username,filename,fileurl,original_file_name,filetype,create_at) VALUES('${await getUserData.result.rows[0].username}','${await response.body.filename}','${await response.body.link}','${originalName}','${await response.body.filetype}','${await response.body.create_at}')`,
            }).then(async() =>{
                res.redirect("/table");
            });
        });
    } catch(e){
        return res.json({
            status: "FAIL",
            error: e,
        });
    }
});


module.exports = router;