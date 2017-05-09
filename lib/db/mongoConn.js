var mongojs = require("mongojs")

getConn()

/**
 * Create a DB Connection and set in on global.db variable
 */
function getConn() {
    try {
        global.db = mongojs(config.db.mongo.urls[config.env])
        keepConnAlive()
    } catch (err) {
        console.error("MONGO_CONN_ERR:", err)
        setTimeout(getConn, 10 * 1000)
    }
}

/**
 * Check if the DB Connection is Alive by pinging to DB in Regular intervals of 1min
 * If DB Connection is closed then it will retry to connect 
 */
function keepConnAlive() {
    var keepAlive = setInterval(function() {

        try {
            db.runCommand({ ping: 1 }, function(err) {
                if (err) {
                    console.error("MONGO_PING_ERR", err)
                    clearInterval(keepAlive)
                    getConn()
                }
            })
        } catch (err) {
            console.error("MONGO_PING_ERR", err)
            clearInterval(keepAlive)
            getConn()
        }

    }, 1 * 60 * 1000)
}