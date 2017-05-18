require("../../config/init.globals")

var userName = process.argv[2]
var password = process.argv[3]
if (!password || !userName) {
    throw new Error("Please follow Command Line Args: node createUser.js <userName> <password>")
}

var user = {
    name: "User",
    uName: userName,
    pwd: helper.saltHash(password),
    email: "user@mqttWebHook.com",
    role: 'USER',
    isDeleted: false
}

var userColl = mongoConfig.users.collName

db.collection(userColl).insert(user, function (err, result) {
    if (!err) {
        console.log('Successfully Created an USER user with UserName:', userName, 'and password:', password);
    } else {
        console.log('Mongo Err:', err);
    }

    process.exit(1);
})
