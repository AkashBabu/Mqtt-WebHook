require("./config/init.globals")

var express = require('express')
var bodyParser = require('body-parser')
var favicon = require('serve-favicon')
var apiRouter = require('./router/api')
var portalRouter = require('./router/portal')
var middlewares = require('./lib/middlewares')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var app =  express()
var whiteList = ['/portal/login']
var port = config.server.ui.port[config.env]

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.engine('html', require('ejs').renderFile)
app.use('/static', express.static(path.join(__dirname, "public")))

app.use(logger('dev'))
app.use(cookieParser(config.token.cookie.secret))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// Middlewares for Creating and validating JWT Tokens
app.post('/login', middlewares.loginUser())
app.post('/register', middlewares.registerUser())
app.use(function(req, res, next) {
    if(whiteList.indexOf(req.path) > -1) {
        next()
    } else if (req.urlRedirect){
        req.urlRedirect = false;
        next()
    } else {
        middlewares.validateToken(req, res, next)
    }
})
app.get("/favicon.ico", function(req, res){
    res.status(404).send("Not Found")
})  

// Routers
app.use('/api', apiRouter)
app.use('/portal', portalRouter)

// Error Handlers
app.use(function(req, res) {
    res.status(404).send("Page Not Found")
})
app.use(function(err, req, res, next) {
    errLog.error("EXPRESS_ERR-", err);
    res.status(500).send("Internal Server Error")
})


// Server Start
app.listen(port, function(err) {
    if(err) {
        errLog.error('Error in starting Express App - MQTT_WEBHOOK');
    } else {
        genLog.log('MQTT-WebHook Server running on port:', port);
    }
})

process.on('uncaughtException', function(err) {
    errLog.error('Uncaught Exception:', err);
})