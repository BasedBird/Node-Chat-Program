if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

webSocket = new WebSocket('ws://45.72.220.8/', 'echo-protocol');

webSocket.onopen = (event) => {
  webSocket.send("Connected");
};

webSocket.onclose = (event) => {
  alert("connection lost :(");
};

webSocket.addEventListener("message", (event) => {
  window.location.replace("./chat");
});

function submit(){
  webSocket.send('101 ' + document.getElementById('uname').value);
}
