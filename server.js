#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
const fs = require('fs');
const sql_driver = require('./MysqlDriver');
const Queue = require('./Queue');

const _ROOT = "./public/";
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
    console.log(latest_messages.all);
  },
  reject => {}//pass
);

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url + "from " + request.socket.remoteAddress);
    if (request.url == '/'){
      response.writeHead(200, { 'content-type': 'text/html' });
      fs.createReadStream(_ROOT + 'index.html').pipe(response);
    }
    else if (request.url == '/sign_in.js'){
      response.writeHead(200, { 'content-type': 'text/javascript' });
      fs.createReadStream(_ROOT + 'sign_in.js').pipe(response);
    }
    else if (request.url == '/chat'){
      response.writeHead(200, { 'content-type': 'text/html' });
      fs.createReadStream(_ROOT + 'chat.html').pipe(response);
    }
    else if (request.url == '/chat.js'){
      response.writeHead(200, { 'content-type': 'text/javascript' });
      fs.createReadStream(_ROOT + 'chat.js').pipe(response);
    }
});
server.listen(PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + PORT);
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var code = message.utf8Data.split(' ')[0];
            var data = message.utf8Data.slice(code.length).trim();
            var uname = usernames.get(request.socket.remoteAddress);
            switch(code){
              //sign in 
              case '101':
                console.log('[101] From ' + request.socket.remoteAddress + ': ' + data);
                usernames.set(request.socket.remoteAddress, data);
                connection.sendUTF(data);
                break;
              //redirect to sign in page if not signed in
              case '303':
                if (uname == undefined){
                  connection.sendUTF('303');
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
                wsServer.broadcast('304-1 ' + hashedID);
                wsServer.broadcast('304-2 ' + uname + ': ' + content);
                break;
              //delete message
              case '305':
                console.log('[305] From ' + uname + ': Request to delete: ' + data);
                wsServer.broadcast('305 ' + data);
                break;
              //get recent messages
              case '306':
                latest_20 = latest_messages.all;
                for (let i = 0; i < latest_20.length; i++){
                  let id = latest_20[i][2];
                  let content = latest_20[i][0] + ': ' + latest_20[i][1];
                  connection.sendUTF('304-1 ' + id);
                  connection.sendUTF('304-2 ' + content);
                }
                break;
              default:
                console.log('[???] From ' + request.socket.remoteAddress + ': ' + data);
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            //connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
