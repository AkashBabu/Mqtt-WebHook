var router = require('express').Router()

router.get("/logout", function(req, res) {
    res.clearCookie("token")
    helperResp.sendOk(res, "Successfully Logged Out")
})

var roleRouter = {
    ADMIN: (require("./routes/ADMIN/router")),
    USER: (require("./routes/USER/router")),
}

router.use(function(req, res, next) {
    var role = req.user.role;

    var roleRoutes = roleRouter[role]

    if (!roleRoutes) {
        helperResp.sendUnauth(res)
    } else {
        roleRoutes(req, res, next)
    }
})

module.exports = router