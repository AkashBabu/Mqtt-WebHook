global.path = require("path")
var jsonfile = require("jsonfile")
var configFile = __dirname + "/config.json"
var mongoConfigFile = __dirname +  '/config.mongo.json'
global.config = jsonfile.readFileSync(configFile)
global.mongoConfig = jsonfile.readFileSync(mongoConfigFile)

require("../lib/db/mongoConn")
require("../lib/logger")

var serverHelper = require('server-helper')
var Helper = serverHelper.Helper
var HelperMongo = serverHelper.HelperMongo
var HelperResp = serverHelper.HelperResp
var HelperValidate = serverHelper.HelperValidate
var HelperTransform = serverHelper.HelperTransform

HelperResp.prototype.sendUnauth = function(res, comment) {
  res.status(401).send({
      error: true,
      data: comment || 'Unauthorized'
  })
}

global.helper = new Helper(true)
global.helperMongo = new HelperMongo(config.db.mongo.url, true)
global.helperResp = new HelperResp(true)
global.helperValidate = new HelperValidate(true)
global.helperTransform = new HelperTransform(true)
global.Crud = serverHelper.Crud

global.async = require("async")