require("../config/init.globals")

var password = 'MqttWebAdmin'
var user = {
    name: "Admin",
    uName: "Admin",
    password: helper.saltHash(password),
    email: "admin@mqttWebHook.com",
    role: 'ADMIN'
}

var userColl = mongoConfig.users.collName

db.collection(userColl).insert(user, function(err, result) {
    if(!err) {
        console.log('Successfully Created an ADMIN user with UserName:', user.name, 'and password:', password);
    } else {
        console.log('Mongo Err:', err);
    }
})
