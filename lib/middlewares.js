var moment = require('moment')
var jwt = require('jwt-simple')

var userColl = mongoConfig.users.collName
var roles = ['ADMIN', 'USER']

module.exports = {

    loginUser: function () {
        return function (req, res) {
            var body = req.body || {}
            // testLog.log('login user:', body);

            db.collection(userColl).findOne({
                uName: body.uName,
                isDeleted: false
            }, function (err, user) {
                if (user) {
                    var valid = helper.verifySaltHash(user.pwd, body.pwd)
                    if (valid) {
                        delete user.pwd;
                        sendToken(res, user)
                    } else {
                        res.status(401).send({ error: true, data: "Invalid UserName or Email ID" })
                    }
                } else {
                    if (err) {
                        helperResp.sendServerError(res)
                    } else {
                        // helperResp.sendUnauth(res)
                        res.status(401).send({ error: true, data: "Invalid UserName or Email ID" })
                    }
                }
            })
        }
    },
    registerUser: function () {
        return function (req, res) {

            var body = req.body || {}

            var validations = [
                {
                    name: 'name',
                    type: String,
                    errMsg: "Name Can only be a String"
                }, {
                    name: "email",
                    type: String,
                    validate: [helperValidate.isEmail, uniqueUserEmail],
                    validateErrMsg: ["Invalid Email", "Email ID Has already been registered"],
                    errMsg: "Email Can only be a String"
                }, {
                    name: "uName",
                    type: String,
                    validate: uniqueUserName,
                    validateErrMsg: "User Name Already Exists",
                    errMsg: "User Name can only be a String"
                }, {
                    name: 'pwd',
                    type: String,
                    transform: helperTransform.toSaltHash,
                    errMsg: "Password can only be a String"
                }]

            helper.validateFieldsExistenceCb(body, validations, true, function (err) {
                // testLog.log('reg validations:', err);
                if (err) {
                    helperResp.sendError(res, err)
                } else {
                    body.isDeleted = false
                    body.role = "USER"
                    db.collection(userColl).insert(body, function (err, user) {
                        if (user) {
                            sendToken(res, user)
                        } else {
                            helperResp.sendServerError(res)
                        }
                    })
                }
            })
        }
    },
    validateToken: function (req, res, next) {
        var token = (req.signedCookies && req.signedCookies['token']) || (req.headers['x-access-token'] || req.body && req.body.access_token) || (req.query && req.query.access_token) || null; // Get JWT Token
        if (token) {
            var decToken;
            try {
                decToken = jwt.decode(token, config.token.secret)
            } catch (err) {
                return helperResp.sendUnauth(res)
            }

            if (decToken && decToken.expires && decToken.iss) {
                if (moment(decToken.expires).diff(moment(), 'minute') > 0) {
                    db.collection(userColl).findOne({
                        _id: db.ObjectId(decToken.iss),
                        isDeleted: false
                    }, {
                            pwd: 0,
                            isDelete: 0,
                        }, function (err, user) {
                            req.user = user;
                            if (roles.indexOf(req.user.role) > -1) {
                                // testLog.log('Valid Role:', req.user.role);
                                next()
                            } else {
                                // testLog.log('Invalid Role:', req.user.role);
                                helperResp.sendUnauth(res)
                            }
                        })
                } else {
                    helperResp.sendUnauth(res)
                }
            } else {
                helperResp.sendUnauth(res)
            }
        } else {
            helperResp.sendUnauth(res)
            // res.status(401).send("Unauthorized")
        }
    }
}

function sendToken(res, user) {
    // testLog.log('Send Token');
    var expires = moment().add(config.token.validity, 'day')._d
    var token = {
        iss: user._id,
        expires: expires
    }

    var encToken = jwt.encode(token, config.token.secret, 'HS256');
    res.cookie('token', encToken, { signed: true })

    res.status(200).send({
        error: false,
        data: {
            token: encToken,
            expires: expires,
            user: user
        }
    })
}

function uniqueUserName(uName, cb) {
    // testLog.log("args for uniqueUserName:", arguments);
    db.collection(userColl).findOne({
        uName: uName,
        isDeleted: false
    }, { _id: 1 }, function (err, user) {
        cb(err, !user)
    })
}

function uniqueUserEmail(email, cb) {
    // testLog.log("args for uniqueUserName:", arguments);
    db.collection(userColl).findOne({
        email: email,
        isDeleted: false
    }, { _id: 1 }, function (err, user) {
        cb(err, !user)
    })
}