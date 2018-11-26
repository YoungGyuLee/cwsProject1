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
    temp: {out : 0, in : 0},
    humidity: 0
};

var checkTemp = function(){
    setInterval(function(){
        mqtt.connected = true;
        console.log('온도, 습도를 측정합니다.')
    
        sensor.who = readlineSync.question('착용자 : ');
        sensor.temp.out = readlineSync.question('외부 온도 : ');
        sensor.temp.in = readlineSync.question('내부 온도 : ');
        sensor.humidity = readlineSync.question('습도 : ');
    
        sensor.emitter.emit('temphu');
    })
};

mqtt.client.on('connect', checkTemp);

var checkEvent = function(){

    if(sensor.who!=null){
        var msg;
        //여기서 0,30은 device 저장값에 따라 달라질 것
        var state = {out : "", in : "", humidity : ""};
        
        if(sensor.temp.out < info.seosor_bound[sensor.who].temp.out_lower){
            state.out = "out:low";
            //누구의 옷에서 감지된 것인지도 보내야 함.
        }else if(sensor.temp.out > info.seosor_bound[sensor.who].temp.out_upper){
            state.out = "out:high";       
        }
    
        if(sensor.temp.in < info.seosor_bound[sensor.who].temp.in_lower){
            state.in = "in:low";     
        } else if(sensor.temp.in > info.seosor_bound[sensor.who].temp.in_upper){
            state.in = "in:high";             
        }
    
        if(sensor.humidity > info.seosor_bound[sensor.who].humidity){
            state.humidity = "humidity:high"
        }else if(sensor.humidity < info.seosor_bound[sensor.who].humidity){
            state.humidity = "humidity:low"            
        }
    
    
        msg = {type : "sensor:temperature", detail : state, who : sensor.who}    
        console.log('온도 이상값 발견');    
        mqtt.client.publish('sensor', JSON.stringify(msg));
    }

};


sensor.emitter.on('temphu', checkEvent)

