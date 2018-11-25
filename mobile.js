const http = require('http');
const mqtt_module = require('mqtt');
const events = require('events');
const readlineSync = require('readline-sync');
const beautify = require('json-beautify');

const mqtt_url = require('./mqtt_url.js');

var mqtt = {
    url: mqtt_url.url,
    client: null,
    connected: false
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


    if(msg.type == "weight"){
        if(msg.detail == "none")
            console.log(msg.who + '의 옷에 아무것도 없습니다.')
        else
            console.log(msg.who + '의 옷에 무언가 있습니다.')   

        info.state_board[msg.who].weight = msg.detail;         
    }
 
    if(msg.type == "heart"){
        if(msg.detail == "fine")
            console.log(msg.who + '의 심박수가 안정적입니다.')
        else if(msg.detail == "low")
            console.log(msg.who + '의 심박수가 낮습니다.')
        else 
            console.log(msg.who + '의 심박수가 높습니다.') 

        info.state_board[msg.who].heart = msg.detail;
    }


        

    var msg2 = {who : msg.who, type : "etc", weight : info.state_board[msg.who].weight, heart : info.state_board[msg.who].heart};            
    
    
    mqtt.client.publish('cloth', JSON.stringify(msg2));
    
}

mqtt.client.on('message', mobile);