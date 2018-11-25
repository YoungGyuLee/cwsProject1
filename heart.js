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
    heart: 0
};

var checkWeight = function(){
    
        mqtt.connected = true;
        console.log('심박수를 측정합니다.');
    
        sensor.who = readlineSync.question('착용자 : ');
        sensor.heart = readlineSync.question('현재 심박수 : ');
    
        sensor.emitter.emit('heart');
    
};

var state = "fine";


mqtt.client.on('connect', checkWeight);

var checkEvent = function(){

    if(sensor.who!=null){
        var msg;
        //여기서 0,30은 device 저장값에 따라 달라질 것
        console.log(sensor.heart);
        
        if(sensor.heart <= (info.seosor_bound[sensor.who].heart*2/3) ){
            state = "low";
            //누구의 옷에서 감지된 것인지도 보내야 함.
        }else if(sensor.heart >= (info.seosor_bound[sensor.who].heart*3/2)){ 
            state = "high";       
        }
      
        msg = {type : "sensor:heart", detail : state, who : sensor.who}    
        console.log('심박수 감지');    
        mqtt.client.publish('sensor', JSON.stringify(msg));
    }

};


sensor.emitter.on('heart', checkEvent)

