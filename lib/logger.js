var Logger = require("logger-switch")

global.testLog = new Logger("Test")
global.genLog = new Logger("Gen")
global.errLog = new Logger("Err")

if (config.env == "DEV" || config.env == "TEST") {
    testLog.activate()
    genLog.activate()
    errLog.activate()
} else if (config.env == 'PROD') {
    testLog.deactivate()
    genLog.activate()
    errLog.activate()

    genLog.timestamp("D-MMM-YY, h:mma")
    errLog.timestamp("D-MMM-YY, h:mma")

} else {
    console.error("INVALID ENVIRONMENT PROVIDED IN config/config.json")
}