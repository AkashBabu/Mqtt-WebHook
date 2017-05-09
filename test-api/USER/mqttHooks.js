var chai = require('chai')
chai.use(require('chai-http'))

var should = chai.should()
var server = require("../../uiServer")
var agent = chai.request.agent(server)

var jsonfile = require('jsonfile')
var configFile = __dirname + "/../../config/config.json"
var mongoConfigFile = __dirname + "/../../config/config.mongo.json"
var config = jsonfile.readFileSync(configFile)
var mongoConfig = jsonfile.readFileSync(mongoConfigFile)

var userColl = mongoConfig.users.collName;
var mqttHookColl = mongoConfig.mqttHooks.collName;

var mongo = require('mongojs')
var db = mongo(config.db.mongo.urls[config.env])
var Helper = require('server-helper').Helper
var helper = new Helper(true)

describe("USER- MqttWebHook /api/mqttWebHook", () => {
    before((done) => {
        // create db and user in test db
        // Login
        var password = 'user'
        var user = {
            name: "user",
            uName: "user",
            email: "user@mail.com",
            role: "USER",
            isDeleted: false,
            pwd: helper.saltHash(password)
        }
        db.collection(userColl).insert(user, function(err, result) {
            if (result) {
                agent
                    .post("/login")
                    .send({ uName: user.uName, pwd: password })
                    .then(function(res) {
                        res.should.have.status(200)
                        res.error.should.be.eql(false)
                        res.should.have.cookie("token")

                        done()
                    })

            } else {
                console.error("Failed Initialization")
                console.error('Failed to Add User')
            }
        })
    })
    beforeEach(done => {
        db.collection(mqttHookColl).remove({}, done)
    })

    after(done => {
        // drop test db
        // db.dropDatabase(done)
        done()
    })
    it("should create a new mqttHook record POST /api/mqtt-webhooks", (done) => {
        var record = {
            name: "Test-Record",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdfasdf"
            },
            mqttHook: {
                broker: "iot.eclipse.org:1883",
                topic: "/Test"
            }
        }

        agent
            .post("/api/mqtt-webhooks")
            .send(record)
            .then((res) => {
                res.should.have.status(200)
                res.body.error.should.not.be.ok
                res.body.data.should.be.an("object")
                should.exist(res.body.data._id)

                done()
            })
    })
    it("should check for duplicate name in POST /api/mqtt-webhooks", (done) => {
        var record = {
            name: "Test-Record",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdfasdf"
            },
            mqttHook: {
                broker: "iot.eclipse.org:1883",
                topic: "/Test"
            }
        }

        agent
            .post("/api/mqtt-webhooks")
            .send(record)
            .then((res) => {
                res.should.have.status(200)
                res.body.error.should.not.be.ok
                res.body.data.should.be.an("object")
                should.exist(res.body.data._id)

                var record = {
                    name: "Test-Record",
                    httpHook: {
                        event: "asdf:asdf:asdf",
                        secret: "asdfasdf"
                    },
                    mqttHook: {
                        broker: "iot.eclipse.org:1883",
                        topic: "/Test"
                    }
                }

                agent
                    .post("/api/mqtt-webhooks")
                    .send(record)
                    .then((res) => {
                        res.should.have.status(400)
                        res.body.error.should.be.ok
                        res.body.data.should.be.a("string")
                        res.body.data.should.be.eql("Please Choose a different Name")

                        done()

                    })
            })

        done()
    })
    it("should get a single record GET /api/mqtt-webhooks/:id", function(done) {
        var record = {
            name: "Test-Record",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdfasdf"
            },
            mqttHook: {
                broker: "iot.eclipse.org:1883",
                topic: "/Test"
            }
        }

        agent
            .post("/api/mqtt-webhooks")
            .send(record)
            .then((res) => {
                res.should.have.status(200)
                res.body.error.should.not.be.ok
                res.body.data.should.be.an("object")
                should.exist(res.body.data._id)
                    // console.log('=============done1==========')

                agent
                    .get("/api/mqtt-webhooks/" + res.body.data._id)
                    .then(res1 => {
                        // console.log('res1:', res1.statusCode)
                        res1.should.have.status(200)
                        res1.body.error.should.not.be.ok;
                        res1.body.data.should.be.an('object');
                        should.exist(res1.body.data._id)
                        res1.body.data.name.should.be.eql(res.body.data.name)

                        done()
                    })
            })
    })
    it.only("should get a list of records GET /api/mqtt-webhooks", function(done) {
        var record = {
            name: "Test-Record",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdfasdf"
            },
            mqttHook: {
                broker: "iot.eclipse.org:1883",
                topic: "/Test"
            }
        }

        agent
            .post("/api/mqtt-webhooks")
            .send(record)
            .then(res => {
                res.should.have.status(200)

                record.name = "Test-Record2"
                agent
                    .post("/api/mqtt-webhooks")
                    .send(record)
                    .then(res1 => {
                        res1.should.have.status(200)

                        agent
                            .get("/api/mqtt-webhooks")
                            .then(res2 => {
                                res2.should.have.status(200)
                                res2.body.error.should.not.be.ok
                                res2.body.data.should.be.an('object')
                                should.exist(res2.body.data.count)
                                res2.body.data.list.should.be.an('array')
                                res2.body.data.list.length.should.be.eql(2)
                                var rec = res2.body.data.list[0]

                                should.exist(rec._id)
                                should.exist(rec.name)
                                should.exist(rec.httpHook.event)
                                should.exist(rec.httpHook.secret)
                                should.exist(rec.mqttHook.broker)
                                should.exist(rec.mqttHook.topic)

                                done()
                            })
                    })
            })
    })
    it("should update an existing record PUT /api/mqtt-webhooks/:id")
    it("should delete a record DELETE /api/mqtt-webhooks/:id")
})