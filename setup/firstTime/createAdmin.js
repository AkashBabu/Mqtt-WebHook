require("../config/init.globals")

var username = process.argv[2]
var password = process.argv[3]
if (!password || !username) {
    throw new Error("Please follow Command Line Args: node createAdmin.js <userName> <password>")
}

var user = {
    name: "Admin",
    uName: userName,
    password: helper.saltHash(password),
    email: "admin@mqttWebHook.com",
    role: 'ADMIN'
}

var userColl = mongoConfig.users.collName

db.collection(userColl).insert(user, function (err, result) {
    if (!err) {
        console.log('Successfully Created an ADMIN user with UserName:', user.name, 'and password:', password);
    } else {
        console.log('Mongo Err:', err);
    }
})
