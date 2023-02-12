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
const config = require("../configs/config.js");

router.get('/table', urlEncoded, async(req, res) =>{
    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length === 0){
        return res.redirect("/login");
    }

    const images = await query({
        sql: `SELECT * FROM user_data WHERE username='${checkLogin.result.rows[0].username}'`,
    });

    res.render('index.ejs', {
        title: "TABLE",
        error: null,
        data: {
            images: images.result.rows,
        }
    })
});

router.get('/table/delete-data', async(req, res) =>{
    // เช็คการเข้าสู่ระบบ
    const checkLogin = await query({
        sql: `SELECT * FROM save_login WHERE ip='${await get_ip(req)}'`,
    });
    if(checkLogin.result.rows.length === 0){
        return res.redirect("/login");
    }

    const { id } = req.query ?? {};
    if(typeof id === "undefined"){
        return res.json({
            status: 'FAIL',
            error: `information missing`,
        });
    }

    try {
        const getImageData = await query({
            sql: `SELECT * FROM user_data WHERE username='${await checkLogin.result.rows[0].username}' AND unique_id=${id}`,
        });
        if(getImageData.result.rows.length === 0){
            return res.json({
                status: "FAIL",
                error: `Data not found`,
            });
        }

        const options = {
            uri: `${config.api.server}/api/delete-image`,
            method: 'POST',
            json: {
                "filename" : `${await getImageData.result.rows[0].filename}`
            }
        }
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
                sql: `DELETE FROM user_data WHERE unique_id=${id}`,
            }).then(() =>{
                res.redirect("/table");  
            });  
        });
    }
    catch(e){
        return res.json({
            status: 'FAIL',
            error: e,
        });
    }
});


module.exports = router;