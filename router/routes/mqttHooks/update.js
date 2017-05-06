var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res ) {
    var body = req.body || {}

    helperMongo.update(mqttHookColl, body, helper.handleResult.bind(res))

    // helperResp.sendError(res)
}