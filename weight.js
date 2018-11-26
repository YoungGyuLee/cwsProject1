const http = require('http');
const mqtt_module = require('mqtt');
const events = require('events');
const readlineSync = require('readline-sync');
const beautify = require('json-beautify');


const info = require('./info.js');


const mqtt_url = require('./mqtt_url.js');

var mqtt = {
    url: mqtt_url.url,
    client: null,
    connected: false
};


mqtt.client = mqtt_module.connect(mqtt.url);


// device
var sensor = {
    emitter: new events.EventEmitter(),
    who: null,
    weight: 0
};

var checkWeight = function(){
    setInterval(function(){
        mqtt.connected = true;
        console.log('주머니 속 물건 무게를 측정합니다.')
    
        sensor.who = readlineSync.question('착용자 : ');
        sensor.weight = readlineSync.question('주머니 무게 : ');
    
        sensor.emitter.emit('weight');
    })
};


mqtt.client.on('connect', checkWeight);

var checkEvent = function(){

    if(sensor.who!=null){
        var msg;
        var state;
        
        //여기서 0,30은 device 저장값에 따라 달라질 것
        
        
        if(sensor.weight <= info.seosor_bound[sensor.who].weight){
            state = "none";
            //누구의 옷에서 감지된 것인지도 보내야 함.
        }else{
            state = "something in";   
        }
     
         
        msg = {type : "sensor:weight", detail : state, who : sensor.who}    
        console.log('주머니 속 무게 감지');    
        mqtt.client.publish('sensor', JSON.stringify(msg));
    }

};


sensor.emitter.on('weight', checkEvent)

