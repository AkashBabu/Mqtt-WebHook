var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res) {
    var body = req.body || {}

    var validations = [{
        name: "name",
        type: String,
        validate: validateUnique.bind(req.user),
        validateErrMsg: "Please Choose a different Name",
        errMsg: "Invalid Name"
    }, {
        name: "httpHook",
        type: Object,
        errMsg: 'Invalid HTTP Hook'
    }, {
        name: "mqttHook",
        type: Object,
        errMsg: "Invalid MQTT Hook"
    }]

    helper.validateFieldsExistenceCb(body, validations, true, function(err) {
        if (err) {
            helperResp.sendError(res, err)
        } else {
            var httpHookValidations = [{
                name: "event",
                validate: helperValidate.isRegex,
                validateArgs: ["^[^:]+:[^:]+:[^:]+$"],
                validateErrMsg: "Event Should be like push:examplerepo:refs/heads/master",
                errMsg: "Invalid Event",
                type: String
            }, {
                name: "secret",
                type: String,
                errMsg: "Invalid Secret"
            }]

            helper.validateFieldsExistenceCb(body.httpHook, httpHookValidations, true, function(err) {
                if (err) {
                    helperResp.sendError(res, err)
                } else {
                    var mqttHookValidations = [{
                        name: 'broker',
                        type: String,
                        errMsg: "Invalid Broker"
                    }, {
                        name: "topic",
                        type: String,
                        errMsg: "Invalid Topic"
                    }]

                    helper.validateFieldsExistenceCb(body.mqttHook, mqttHookValidations, true, function(err) {
                        if (err) {
                            helperResp.sendError(res, err)
                        } else {
                            async.autoInject({
                                validateAddition: validateAddition.bind(req.user),
                                insertRecord: ['validateAddition', insertRecord.bind(req)]
                            }, function(err, results) {
                                if (err) {
                                    errLog.error(err)
                                }

                                helperResp.sendAsyncResp(res, err, results.insertRecord)
                            })
                        }
                    })
                }
            })
        }
    })



}

function validateUnique(name, cb) {
    var user = this;
    helperMongo.validateNonExistence(mqttHookColl, {
        user: user._id,
        name: name
    }, cb)
}

function validateAddition(cb) {
    var user = this;
    db.collection(mqttHookColl).find({
        user: user._id
    }).count(function(err, count) {
        if (count != undefined || count != null) {
            if ((count + 1) > (user.limit || config.user.limit)) { // count+1 indicate count after new addition
                cb({
                    code: "Exceeded the max limit of Hooks"
                })
            } else {
                cb(null, true)
            }

        } else {
            if (err) {
                errLog.error(err)
            }
            cb({
                code: "Could Not get the count"
            })
        }
    })
}

function insertRecord(validateAddition, cb) {
    var req = this;
    var body = req.body
    body.enabled = false;
    body.user = req.user._id
    db.collection(mqttHookColl).insert(body, cb)
}