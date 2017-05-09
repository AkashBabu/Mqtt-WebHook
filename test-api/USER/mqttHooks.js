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

describe("USER- MqttWebHook /api/mqtt-webhooks", () => {
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
        db.dropDatabase(done)
        // db.users.remove({}, done)
        // done()
    })


    // BASIC CRUD tests
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
            name: "Test-RecordGet1",
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
                    console.log('=============done1==========')

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
    it("should get a list of records GET /api/mqtt-webhooks", function(done) {
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
                                console.log('res.body:', res2.body);
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
    it("should update an existing record PUT /api/mqtt-webhooks/:id", done => {
        var record = {
            name: "record",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdf"
            },
            mqttHook: {
                broker: "asdf",
                topic: "/asdf"
            }
        }
        agent.post("/api/mqtt-webhooks")
            .send(record)
            .then(res => {
                res.should.have.status(200)

                res.body.data.name = 'record2'

                agent
                    .put('/api/mqtt-webhooks/' + res.body.data._id)
                    .send(res.body.data)
                    .then(res1 => {
                        res.should.have.status(200)
                        res.body.error.should.not.be.ok
                        
                        agent.get("/api/mqtt-webhooks/" + res.body.data._id)
                            .then(res3 => {
                                res3.should.have.status(200)
                                res3.body.error.should.not.be.ok
                                res3.body.data.name.should.be.eql('record2')
                                done()
                            }) 

                    })
            })
    })
    it("should delete a record DELETE /api/mqtt-webhooks/:id", done => {
        var record = {
            name: "recordDelete",
            httpHook: {
                event: "asdf:asdf:asdf",
                secret: "asdf"
            },
            mqttHook: {
                broker: "asdf",
                topic: "/asdf"
            }
        }
        agent.post("/api/mqtt-webhooks")
            .send(record)
            .then(res => {
                res.should.have.status(200)

                agent.delete('/api/mqtt-webhooks/' + res.body.data._id)
                    .then(res => {
                        res.should.have.status(200)

                        db.collection(mqttHookColl).findOne({
                            _id: db.ObjectId(res.body.data._id)
                        }, function(err, result) {
                            should.not.exist(result)
                            should.not.exist(err)
                            done()
                        })
                    })
            })
    })

    // Test Cases
    it("should fetch the list only for the corresponding user GET /api/mqtt-webhooks")
})