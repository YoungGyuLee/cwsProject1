const http = require('http');
const mqtt_module = require('mqtt');
const events = require('events');
const url = require('url');
const readlineSync = require('readline-sync');
const beautify = require('json-beautify');

const event_detector = new events.EventEmitter();


var mqtt = {
    url: "",
    client: null,
    connected: false
};

mqtt.client = mqtt_module.connect(mqtt.url);


var connect = function(){
    mqtt.connected = true;
    console.log('Now, we are talking to the mqtt server !');
    mqtt.client.subscribe('sensor');
}

mqtt.client.on('connect', connect);

var message = function(topic, message){
    var msg = JSON.parse(message.toString());
    //subscribe해서 넘어온 message를 분해하는 곳.
    console.log('여기는 옴');
    
    var adjust;
    var temp = {out : 0, in : 0};

    var alarm = {who : msg.who, weight : "none", heart : "fine"};
    var heart_state = ""
    if (msg.type == "sensor:temperature") {
        //클라이언트가 입려한 이름이 msg.who
        if(msg.detail.out == "out:low"){
            temp.out = 1;
        }else if(msg.detail.out == "out:high"){
            temp.out = -1;
        }

        if(msg.detail.in == "in:low"){
            temp.in = 5;
        }else if(msg.detail.in == "in:high"){
            temp.in = -5;
        }

        if(msg.detail.humidity == "humidity:high"){
            //습도가 높으면 어케 하지 근데..
        }

        adjust = {who : msg.who, temp_out : temp.out, temp_in : temp.in};            
    
        console.log('여기까지 옴');
        mqtt.client.publish('cloth', JSON.stringify(adjust));
    }

    if(msg.type == "sensor:weight"){
        var weight_state = ""        
        if(msg.detail == "none"){
            alarm.weight = "none."
        }else{
            alarm.weight = "something in."
        }
        mqtt.client.publish('mobile', JSON.stringify(alarm));        
    }
}

mqtt.client.on('message', message);









//////////////////////////////////////
// http
//////////////////////////////////////
// monitoring request from a web browser or a client
var server = http.createServer();

server.on('request', function (req, res) {
    if(url.parse(req.url, true, false).path == '/favicon.ico') return;

    var pretty_req = {
        "method" : req.method,
        "url" : url.parse(req.url, true, false).path,
        "service" : url.parse(req.url, true, false).pathname,
    };
    console.log("\n\n[http:request]---------------------------------------------------");
    console.log(beautify(pretty_req, null, 2, 100));

    var url_request = url.parse(req.url, true, false);
    if(url_request.query.request == "dashboard") {
        res.setHeader('Content-Type', 'application/text');
        res.setHeader('Content-Language', 'ko-KR');
        res.writeHead(200);
        res.write(JSON.stringify(human_device.dashboard));
        res.end();
    } else if(url_request.query.request == "notify") {
        var msg2 = { "type": "dashboard:notify", "dashboard" : human_device.dashboard };  
        mqtt.client.publish(url_request.query.id, JSON.stringify(msg2));
    }
});
server.listen(9000);
console.log('HTTP server is running !!!');

