var express = require('express')
var bodyParser = require('body-parser')
var jsonfile = require('jsonfile')
var configFile = __dirname + "/config/config.json"
var config = jsonfile.readFileSync(configFile);

var mongojs = require('mongojs')
var db = mongojs(config.db.mongo.url)

var app = express()
var secretKey = "asdfASDF@1234"

var jsonfile = require("jsonfile")
var configFile = __dirname + "/config/config.json";

var config = jsonfile.readFileSync(configFile)

var port = config.server.httpHook.port[config.env]

app.use(bodyParser.json())

app.post("/:uName", function(req, res) {
    console.log('headers:', req.headers)
    console.log("method:", req.method)
    console.log("user:", req.params.uName)
    console.log("body:", req.body)

    validateSecret(req, function(err) {
        if(err) {
             
        } else {
            // var event = getEvent(req)

        }
    })

    res.status(200).send("Success")
})

function validateSecret (req, cb) {
    var crypto = require('crypto')
    var hmac = crypto.createHmac('sha1', secretKey)
    var computedKey = hmac.update(Buffer.from(JSON.stringify(req.body), 'utf-8'), 'utf-8').digert('hex')
    console.log('Computed Secret:', computedKey);
}

function getEvent (req) {
    var type = req.headers['x-github-event']
    var reponame = ""
    if(req.body && req.body.repository && req.body.repository.name) {
        reponame = req.body.repository.name
    }
    var ref = ""
    if(req.body && req.body.ref) {
        ref = req.body.ref
    }

    return type + ":" + reponame + ":" + ref
}


app.use(function(req, res){
    res.status(404).send("Not Found")
})

app.listen(port, function(err){
    if(err) {
        console.error("Error Starting Http-Hook Server:", err)
    } else {
        console.log('=> HTTP-Hook Server listening on port:', port);
    }
})

process.on("uncaughtException", function(err) {
    console.error('Uncaught Exception', err);
})