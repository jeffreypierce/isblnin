var num = document.getElementById('num');
var body = document.querySelector('body');
var img = document.getElementById('img');
var socket = io.connect('http://localhost');

socket.on('isblnin', function(value){
  
    var isblnin = value.value.toLowerCase();
    num.innerHTML = isblnin;
    body.className = isblnin;
    img.className = isblnin;
  
});
