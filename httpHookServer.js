var express = require('express')
var app = express()

app.use(function(req, res) {
    console.log('headers:', req.headers)
    console.log("body:", req.body)

    res.status(200).send("Success")
})