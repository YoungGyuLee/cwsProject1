const http = require('http');
const mqtt_module = require('mqtt');
const events = require('events');
const readlineSync = require('readline-sync');
const beautify = require('json-beautify');

var mqtt = {
    url : "",
    client : null,
    connected : false
};


mqtt.client = mqtt_module.connect(mqtt.url);


const info = require('./info.js');

var connect = function(){
    mqtt.connected = true;
    console.log('센서로부터 측정된 값으로 이벤트를 받습니다.')

    mqtt.client.subscribe('mobile');
}

mqtt.client.on('connect', connect);

var mobile = function(topic, alarm){
    var msg = JSON.parse(alarm.toString());


    if(msg.weight == "none")
        console.log(msg.who + '의 옷에 아무것도 없습니다.')
    else
        console.log(msg.who + '의 옷에 무언가 있습니다.')    

}

mqtt.client.on('message', mobile);