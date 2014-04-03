var express = require('express'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index', { title: 'Is BLN In?' });
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port')); 
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  var firmata = require('firmata');
  var values = [];
  var debounce_points = 10;
  var valueMean = function(){
      var recentVals = values.slice(-debounce_points),
        n = recentVals.length,
        sum = 0;

    for (var i = 0; i < n; i++) {
        sum += recentVals[i];
    }
    return sum / n;
  };
  var board = new firmata.Board('/dev/tty.usbmodem1421', function(err) {
      if (err) {
        socket.emit('isblnin', {'value': 'MAYBE'});
        console.log(err);
        return;
      }
      console.log('connected');

      console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);
        
      board.analogRead(board.pins[14].analogChannel, function(value){ 

      var mean = valueMean();
    
      if (Math.abs(mean - value) > 50) {
        if(value > 25 && value < 900) {
          socket.emit('isblnin', {'value': 'YES'});
        } else {
          socket.emit('isblnin', {'value': 'NO'});
        }      
      }
    
      values.push(value);
      if (values.length > debounce_points) {
          values = values.slice(-debounce_points);
      }
    });
  });
  
});
