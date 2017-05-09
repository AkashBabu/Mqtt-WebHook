var router = require('express').Router()
var CurrentUser = require("./current")

router.get("/current", CurrentUser)

module.exports = router