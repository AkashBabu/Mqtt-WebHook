var Handlebars = require("handlebars")
var fs = require('fs')
var path = require('path')

var configFile = __dirname + "/../../../config/config.json"
var jsonfile = require("jsonfile")
var config = jsonfile.readFileSync(configFile)


var inFile = path.join(__dirname, 'nginx.conf.template')
var outFile = path.join(__dirname, "nginx.conf")

var source = fs.readFileSync(inFile, 'utf-8')

var template = Handlebars.compile(source)

var data = {
    currDir: __dirname,
    sslDir: path.resolve(path.join(__dirname, "../../firstTime/ssl/")),
    uiServerPort: config.server.ui.port[config.env],
    httpHookServerPort: config.server.httpHook.port[config.env]
}

var compiled = template(data);

var exists = fs.existsSync(outFile)
var ws = fs.createWriteStream(outFile)
ws.write(compiled)
ws.end()

if(exists) {
    console.log("nginx.conf file updated")
} else {
    console.log("nginx.conf file created")
}
