if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

webSocket = new WebSocket('ws://pongcord.mooo.com/', 'echo-protocol');

webSocket.onopen = (event) => {
  webSocket.send("Connected");
};

webSocket.addEventListener("message", (event) => {
  window.location.replace("./chat");
});

function submit(){
  webSocket.send('101 ' + document.getElementById('uname').value);
}

