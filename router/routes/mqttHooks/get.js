var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res ) {
    helperMongo.getForId(mqttHookColl, req.params.id, helper.handleResult.bind(res))
}