const http = require('http');
const mqtt_module = require('mqtt');
const events = require('events');
const url = require('url');
const readlineSync = require('readline-sync');
const beautify = require('json-beautify');

const event_detector = new events.EventEmitter();

const mqtt_url = require('./mqtt_url.js');

var mqtt = {
    url: mqtt_url.url,
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
    var humidity = 0;
    var alarm;
   
    
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
            humidity = -3;
        }else if(msg.detail.humidity == "humidity:low"){
            humidity = 3;
        }

        adjust = {who : msg.who, type : "temp", temp_out : temp.out, temp_in : temp.in, humidity : humidity};            
    
        console.log('온습도 조절');
        mqtt.client.publish('cloth', JSON.stringify(adjust));
    }

    if(msg.type == "sensor:weight"){
        alarm = {who : msg.who, type : "weight" , detail : msg.detail}
        console.log('무게 감지');        
        mqtt.client.publish('mobile', JSON.stringify(alarm));        
    }

    if(msg.type == "sensor:heart"){
        console.log('심박수 감지');
        alarm = {who : msg.who, type : "heart" , detail : msg.detail}
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

