var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res ) {
    var body = req.body || {}
    body.enabled = false;
    body.user = req.user._id
    // testLog.log('Mqtt Hook create body:', body);
    db.collection(mqttHookColl).insert(body, helper.handleResult.bind(res))
}