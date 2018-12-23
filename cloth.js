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

    mqtt.client.subscribe('cloth');
 
}

mqtt.client.on('connect', connect);

var cloth = function(topic, adjust){
    var msg = JSON.parse(adjust.toString());

    if(msg.type == "temp"){
        info.state_board[msg.who].heat += (msg.temp_out + msg.temp_in);
        info.state_board[msg.who].humidity += msg.humidity;        
    }else{
        info.state_board[msg.who].weight = msg.weight;
        info.state_board[msg.who].heart = msg.heart;        
    }

    console.log(msg.who + '의 옷 :\n' + "온도 : " + info.state_board[msg.who].heat + '\n' 
    + "습도 : " + info.state_board[msg.who].humidity + '\n' + "건강 상태 : " + info.state_board[msg.who].heart + '\n' 
    + "주머니 : " + info.state_board[msg.who].weight);
}

mqtt.client.on('message', cloth);