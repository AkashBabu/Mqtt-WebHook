var router = require('express').Router()

router.get('/login', function(req, res) {
    res.render("login.html")
})

router.get("/:level1", function(req, res) {
    try {
        res.render(req.user.role + "/" + req.params.level1 + ".html")
    } catch(err) {
        errLog.error(err);
        res.render("pageNotFound.html")
    }
})


router.get("/:level1/:level2", function(req, res) {
    try {
        res.render(req.user.role + "/" + req.params.level1 + "/" + req.params.level2 + ".html")
    } catch(err) {
        errLog.error(err);
        res.render("pageNotFound.html")
    }
})

module.exports = router