const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencoded = bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
});
const path = require('path');


const config = require("./configs/config.js");


app.use(express.json({limit: '50mb'}));
app.use(urlencoded);
app.use(express.static(path.join(__dirname,'./public')));
app.use(express.static(path.join(__dirname,'./node_modules')));
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
    res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
    next(); 
});


fs.readdirSync("./routers").forEach(async files => {
    let router = require(`./routers/${files}`);
    app.use(router);
    console.log(`[Routes] Loaded : ${files}`);
});

// database setup
fs.readdirSync("./database").forEach(async folders => {
    fs.readdirSync(`./database/${folders}`).forEach(async files => {
        require(`./database/${folders}/${files}`).connect();
        console.log(`[Database] Loaded : ${folders}/${files}`);
    });
});


app.listen(config.app.port, async() =>{
    console.log("[API] App listening on port : " + config.app.port);
});



process.on('unhandledRejection', async(reason, p) =>{
    console.log("[Anti-crash] " + "Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on('uncaughtException', async(err, origin) =>{
    console.log("[Anti-crash] " + "Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on('uncaughtExceptionMonitor', async(err, origin) =>{
    console.log("[Anti-crash] " + "Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});