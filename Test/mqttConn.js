var mqtt = require('mqtt')

var client = mqtt.connect("iot.eclipse.org")

client.on('connect', function(){
    console.log('client connected');
    client.subscribe('test')
})

client.on('message', function(topic, message, payload) {
    console.log('topic:', topic);
    console.log('msg:', message.toString());
})