if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

window.onload = function() {
  document.getElementById("message").focus();
}

webSocket = new WebSocket('ws://45.72.220.8:8324/', 'echo-protocol');

webSocket.onopen = (event) => {document.body.write
  checkSignedIn();
};

webSocket.addEventListener("message", (event) => {
  if (event.data == '303') {
    window.location.replace("./");
  }
  else{
    //document.body.innerHTML = document.body.innerHTML + '<br>' + event.data;
    document.getElementById("chat").innerHTML += '<br>' + event.data;
    document.getElementById("message").value = '';
    document.getElementById("message").focus();
  }
});

document.addEventListener("keydown", function(event){
  if (event.keyCode == 13){
    message_button();
  }
});

function hi_button(){
  webSocket.send('202 ' + "hi");
}

function bye_button(){
  webSocket.send('202 ' + "bye");
}

function message_button(){
  webSocket.send('202 ' + document.getElementById('message').value);
}

function checkSignedIn(){
  webSocket.send('303');
}
