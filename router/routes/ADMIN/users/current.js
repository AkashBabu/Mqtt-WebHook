var userColl = mongoConfig.users.collName

module.exports = function(req, res){
    helperResp.sendOk(res, req.user)
}