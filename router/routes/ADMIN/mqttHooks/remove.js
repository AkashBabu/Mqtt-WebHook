var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res ) {
    helperMongo.remove(mqttHookColl, req.params.id, true, helper.handleResult.bind(res))
}