#!/usr/bin/env node
const path = require('path');
const sql_driver = require('./MysqlDriver');
const Queue = require('./Queue');
const express = require('express')
const _PUBLIC = path.join(__dirname, '/public');
const PORT = 80;
var usernames = new Map();
var latest_messages = new Queue();

sql_driver.fetchLatest().then(
  resolve => {
    let lst = resolve.reverse();
    for (let i = 0; i<lst.length; i++){
      latest_messages.push([lst[i][0], lst[i][1], lst[i][2]]);
    }
    console.log("Done fetching 20 latest messages");
    //console.log(latest_messages.all);
  },
  reject => {}//pass
  );

const app = express();
var expressWS = require('express-ws')(app);
var Wss = expressWS.getWss('/');

app.use((req, res, next)=> {
  console.log(req.url);
  next();
})
app.use('/chat/', express.static(__dirname + '/public/chat'));
app.use('/', express.static(__dirname + '/public/login'));

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})

app.ws('/', function(ws, request) {
  console.log((new Date()) + ' Connection accepted.');
  ws.on('message', function(message) {
    var code = message.split(' ')[0];
    var data = message.slice(code.length).trim();
    var uname = usernames.get(request.socket.remoteAddress);
    switch(code){
    //sign in 
    case '101':
      console.log('[101] From ' + request.socket.remoteAddress + ': ' + data);
      usernames.set(request.socket.remoteAddress, data);
      ws.send(data);
      console.log('sent');
      break;
      //redirect to sign in page if not signed in
    case '303':
      if (uname == undefined){
        ws.send('303');
      }
      break;
    //chat message
    case '304':
      let parse = data.split(' ');
      let id = parse[0];
      let content = data.slice(id.length).trim();
      let hashID;
      console.log('[304] From ' + uname + ': ' + content);
      hashedID = sql_driver.insertMessage(uname, id, content);
      if (latest_messages.size >= 20) latest_messages.pop();
      latest_messages.push([uname, content, hashedID]);
      broadcast('304-1 ' + hashedID);
      broadcast('304-2 ' + uname + ': ' + content);
      break;
    //delete message
    case '305':
      console.log('[305] From ' + uname + ': Request to delete: ' + data);
      broadcast('305 ' + data);
      break;
    //get recent messages
    case '306':
      latest_20 = latest_messages.all;
      for (let i = 0; i < latest_20.length; i++){
        let id = latest_20[i][2];
        let content = latest_20[i][0] + ': ' + latest_20[i][1];
        ws.send('304-1 ' + id);
        ws.send('304-2 ' + content);
      }
      break;
    default:
      console.log('[???] From ' + request.socket.remoteAddress + ': ' + data);
    }
  });
  ws.on('close', function(reasonCode, description) {
    // console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

function broadcast(message){
  Wss.clients.forEach( (client) => {
    client.send(message);
  });
}