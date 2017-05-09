var router = require('express').Router()

router.use("/mqtt-webhooks", require("./mqttHooks/routes"))
router.use("/users", require("./users/routes"))

module.exports = router