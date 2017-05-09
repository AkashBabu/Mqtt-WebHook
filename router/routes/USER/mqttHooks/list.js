var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res) {
    var query = req.query || {}

    // db.collection(mqttHookColl).find({
    //         user: req.user._id
    //     }, function(err, results) {
    //         res.status(200).send({
    //             error: false,
    //             data: {
    //                 count: results.length,
    //                 list: results
    //             }
    //         })
    //     })
    try {
        query.query = JSON.parse(query.query || "{}")
    } catch (err) {
        errLog.error(err);
        query.query = {}
    }
    query.query["user"] = req.user._id;
    testLog.log("query in list:", query);
    // query.query = JSON.stringify(query.query)
    if (query.sort) {
        var val = query.sort
        if (val.indexOf('-') > -1) {
            query.sort[val] = -1;
        } else {
            query.sort[val] = 1
        }
        // query.sort = JSON.stringify(query.sort)
    }

    if (config.env == "DEV") {
        setTimeout(function() {
            helperMongo.getList(mqttHookColl, query, false, helper.handleResult.bind(res))

        }, 1000)
    } else {
        helperMongo.getList(mqttHookColl, query, false, helper.handleResult.bind(res))
    }
}