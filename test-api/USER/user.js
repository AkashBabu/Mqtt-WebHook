var chai = require('chai')
var should = chai.should()

chai.use(require('chai-http'))
var agent = chai.request.agent(require("../../uiServer"))


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

describe("#USER - /api/users", () => {
    before(done=> {
        // create a user and login
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
        //

        done() 

    })
    after(done => {
        // drop test db
        db.dropDatabase(done)
    })

    it('should get the current user logged in GET /api/users/current', done => {
        agent.get("/api/users/current")
            .then(res => {
                res.should.have.status(200)
                res.body.error.should.not.be.ok
                res.body.data.name.should.be.eql("user")
                done()
            })
    })

})