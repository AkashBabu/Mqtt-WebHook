var router = require('express').Router()
var MqttHooks = {
    create: (require("./create")),
    get: (require("./get")),
    list: (require("./list")),
    update: (require("./update")),
    remove: (require("./remove")),
}

var MqttHooksCrud = new Crud(MqttHooks)

router.use(MqttHooksCrud)

module.exports = router