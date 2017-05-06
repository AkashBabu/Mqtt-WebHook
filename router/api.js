var router = require('express').Router()

router.get("/logout", function(req, res) {
    res.clearCookie("token")
    helperResp.sendOk(res, "Successfully Logged Out")
})

router.use("/mqtt-webhooks", require("./routes/mqttHooks/routes"))
router.use("/users", require("./routes/users/routes"))

module.exports = router