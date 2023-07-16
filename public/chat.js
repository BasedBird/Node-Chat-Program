var currNode = null;

if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

window.onload = function() {
  document.getElementById("message").focus();
}

webSocket = new WebSocket('ws://45.72.220.8/', 'echo-protocol');

webSocket.onopen = (event) => {document.body.write
  checkSignedIn();
  webSocket.send('306');
};

webSocket.addEventListener("message", (event) => {
  if (event.data == '303') {
    window.location.replace("./");
  }
  else{
    var code = event.data.split(' ')[0];
    var data = event.data.slice(code.length+1);
    switch(code) {
      case '304':
        var id = data.split(' ')[0];
        var parent = document.getElementById('chat');
        var newDiv = document.createElement('div');
        var newContent = document.createTextNode(data.slice(id.length+1));
        var newButton = document.createElement('button');
        newButton.type = "button";
        newButton.innerHTML = "Delete";
        newButton.addEventListener('click', function(e) {
          webSocket.send('305 ' + e.target.parentNode.id);
        });

        newDiv.setAttribute('id', id);
        newDiv.appendChild(newContent);
        newDiv.appendChild(newButton);
        parent.appendChild(newDiv);
        //document.getElementById("chat").innerHTML += '<br>' + event.data;
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
        break;
      case '305':
        document.getElementById(data).innerHTML = "deleted";
        break;
      default:
    }
    //document.body.innerHTML = document.body.innerHTML + '<br>' + event.data;
    //document.getElementById("chat").innerHTML += '<div id=\'' + id '\'>' + event.data.slice(id.length) + '</div>';
    //document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
  }
});

document.addEventListener("keydown", function(event){
  if (event.keyCode == 13){
    message_button();
  }
});

function hi_button(){
  webSocket.send('304 ' + "hi");
}

function bye_button(){
  webSocket.send('304 ' + 'bye');
}

function message_button(){
  webSocket.send('304 ' + document.getElementById('message').value);
  document.getElementById("message").value = '';
  document.getElementById("message").focus();
}

function delete_button(e){
  webSocket.send('111 ' + e.target.id);
}

function checkSignedIn(){
  webSocket.send('303');
}
