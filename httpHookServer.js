var express = require('express')
var app = express()

var jsonfile = require("jsonfile")
var configFile = __dirname + "/config/config.json"

var config = jsonfile.readFileSync(configFile)

var port = config.server.httpHook.port[config.env]

app.use(function(req, res) {
    console.log('headers:', req.headers)
    console.log("body:", req.body)

    res.status(200).send("Success")
})

app.listen(port, function(err){
    if(err) {
        console.error("Error Starting Http-Hook Server:", err)
    } else {
        console.log('HTTP-Hook Server listening on port:', port);
    }
})