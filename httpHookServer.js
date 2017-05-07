require("./config/init.globals")

var mqtt = require('mqtt')
var express = require('express')
var bodyParser = require('body-parser')
var logger = require("morgan")

var userColl = mongoConfig.users.collName
var mqttHookColl = mongoConfig.mqttHooks.collName
var mqttHookInterval = config.mqttHook.interval;
var port = config.server.httpHook.port[config.env]

var app = express()

// This is just to Test the Hook
app.use(logger('dev'))
app.use(bodyParser.json())

var mqttBuffer = [] // Buffer(Queue) to Store Mqtt Ping for 1sec
app.post("/:uName", function (req, res) {
    async.autoInject({
        getUser: getUser.bind(req.params),
        getHooks: ['getUser', getHooks.bind(req)]
    }, function (err, results) {
        if (err) {
            errLog.error(err)
            res.status(400).send("Bad Request")
        } else {
            results.getHooks.forEach((hook) => {
                var crypto = require('crypto')
                var hmac = crypto.createHmac('sha1', hook.httpHook.secret)
                var computedSignature = hmac.update(Buffer.from(JSON.stringify(req.body), 'utf-8'), 'utf-8').digest('hex')
                if (req.headers['x-hub-signature']) {
                    if (req.headers['x-hub-signature'].split("=")[1] == computedSignature) {
                        testLog.log('Signature Matched');
                        mqttBuffer.push(Object.assign(hook, { uName: req.params.uName }))
                    } else {
                        testLog.log('Signature Did not match');
                    }
                }
            })
            res.status(200).send("Success")
        }
    })
})


function getUser(cb) {
    var params = this
    db.collection(userColl).findOne({
        uName: params.uName
    }, {
            _id: 1
        }, function (err, user) {
            if (user) {
                cb(null, user)
            } else {
                if (err) {
                    errLog.error(err);
                }
                cb("User Not Found")
            }
        })
}

/**
 * Find all the hooks associated with the User for the Event
 */
function getHooks(user, cb) {
    var req = this;
    var event = getEvent(req)
    genLog.log('Got Event:', event);
    var query = { // find the matching event, that is enabled
        user: db.ObjectId(user._id),
        "httpHook.event": event,
        enabled: true,
    }
    testLog.log('query for hooks:', query);

    db.collection(mqttHookColl).find(query, function (err, hooks) {
        if (err) {
            errLog.error(err)
        }
        cb(null, hooks || [])
    })
}
/**
 * Return the github Event from the Request Object
 * It returns event in the form of event:reponame:ref
 * 
 * @returns {string}
 */
function getEvent(req) {
    var type = req.headers['x-github-event']
    var reponame = ""
    if (req.body && req.body.repository && req.body.repository.name) {
        reponame = req.body.repository.name
    }
    var ref = ""
    if (req.body && req.body.ref) {
        ref = req.body.ref
    }

    return type + ":" + reponame + ":" + ref
}

// Not Found
app.use(function (req, res) {
    res.status(404).send("Not Found")
})

// Start Server
app.listen(port, function (err) {
    if (err) {
        errLog.error("Error Starting Http-Hook Server:", err)
    } else {
        genLog.log('=> HTTP-Hook Server listening on port:', port);
    }
})

setInterval(function () { // Mqtt Hook Publisher
    var len = mqttBuffer.length
    for (var i = 0; i < len; i++) {
        var hook = mqttBuffer.shift()
        try { // Start a new client for each ping
            var broker = (hook.mqttHook.broker.split("://").length > 1) ? hook.mqttHook.broker.split("://")[1] : hook.mqttHook.broker.split("://")[0]
            testLog.log('Broker:', broker)
            testLog.log('Hook:', hook)
            var client = mqtt.connect("mqtt://" + broker)
            client.on('connect', function () {
                // testLog.log('Client Connected');
                var topic = config.mqttHook.topicBase + "/" + hook.uName + hook.mqttHook.topic;
                client.publish(topic, JSON.stringify({
                    event: hook.httpHook.event
                }))
            })
        } catch (err) {
            errLog.error(err);
            errLog.error('Failed to Publish Event:', hook.httpHook.event, 'on Topic:', hook.mqttHook.topic, 'via Broker:', hook.mqttHook.broker);
        }
    }
}, mqttHookInterval)

process.on("uncaughtException", function (err) {
    errLog.error('Uncaught Exception', err);
})