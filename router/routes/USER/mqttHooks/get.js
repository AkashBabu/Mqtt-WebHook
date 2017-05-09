var mqttHookColl = mongoConfig.mqttHooks.collName

module.exports = function(req, res) {
    testLog.log('Get on single webhook')

    db.collection(mqttHookColl).findOne({
        _id: db.ObjectId(req.params.id),
        user: req.user._id
    }, function(err, result) {
        if (err) {
            errLog.error(err)
        }

        console.log('result:', result)

        res.status(err ? 400 : 200).send({
            error: !!err,
            data: err ? {} : result || {}
        })
    })
}