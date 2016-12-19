var app = require('http').createServer();
//var bodyParser = require('body-parser');
var io = require('socket.io')(app);   
var exec = require('child_process').exec,
  child;
var  page = {
    current: "",
    volume:"",
    playlist:"",
    num:"",
    change:""
  };
var playlist = "nodepl2";

var Repeat = require('repeat');

function generation_page () {
//console.log(page.change);
  exec('mpc current', function(error, stdout, stderr) {
	if (page.current !== stdout.substr(0,100)) {
		page.current = stdout.substr(0,100);
		page.change = 1;
		 console.log(page.current);
	}
  });
  exec('mpc volume', function (error, stdout, stderr) {
   if (page.volume !== stdout) {
		 page.volume = stdout;
		 page.change = 1;
		 console.log("volume Changed");
	}
  });

  exec('mpc playlist', function(error, stdout, stderr) {
	stdout = stdout.split("\n");
	var listJson = [];
	for (var i in stdout) {
		if (stdout[i].length > 100) {
				listJson.push({id: parseInt(i)+1, title: stdout[i].substring(0, stdout[i].indexOf(':'))}); 
		}
	 	else {	listJson.push({id: parseInt(i)+1, title: stdout[i]}); }
	}

	if (page.playlist !== listJson) { 
		 page.playlist = listJson;
//		 console.log("playl Changed");
//		 page.change = 1;
	}
  });

}

Repeat(generation_page).every(1000, 'ms').start();


//################################################# SOCKET ##########################################

io.on('connection', function (socket) {

	socket.broadcast.emit('GlobalControl', page);
        socket.emit('GlobalControl', page);
function pushPage() {
	if (page.change == 1) {
	socket.broadcast.emit('GlobalControl', page);
        socket.emit('GlobalControl', page);
	page.change = 0;
        }
}

Repeat(pushPage).every(500, 'ms').start();

	socket.on('control', function (a) {
		console.log(a);
  		exec('mpc $act $arg', {env: {'act': a.action, 'arg': a.arg}});
		generation_page();	
	});

    socket.on('changeBgColor', function (color) {
        console.log(color);
        socket.broadcast.emit('changeBgColorEveryWhere', color.color);
        socket.emit('changeBgColorEveryWhere', color.color);
    });


    socket.on('addRadio', function (newradio) {
        console.log(newradio);
	var expression = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*///gi;
	var regex = new RegExp(expression);
	var url  = newradio.match(regex);
        if (newradio === null || newradio === undefined) {
        	console.log("empty");
	}
        else {
          if (newradio.match(regex) ) {
	    generation_page();
            exec('mpc $act  $arg', {env: {'act': "add", 'arg': newradio}});
	    exec('mpc $act $arg', {env: {'act': "save", 'arg': playlist}});	
            page.change = 1;	
          }       
          else {console.log("not valid url");}
      	}	
	
    });

});

//################################################# START APP ##########################################

exec('mpc $act $arg', {env: {'act': "clear", 'arg': ""}});
exec('mpc $act $arg', {env: {'act': "load", 'arg': playlist}});
//server.listen('3000');
app.listen('3000');
