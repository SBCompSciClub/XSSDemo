let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let messages = [];

app.use(express.static('res'));

app.all('/', (req, res)=>{
	res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket)=>{
	console.log('User connected');
	socket.on('disconnect', (socket)=>{
		console.log('User disconnected');		
	});
	socket.on('message_sent', (message)=>{
		messages.push(message);
		io.emit('message_received', message);
	});
});

http.listen( (process.env.PORT || 8080), ()=>{
	console.log("Main page working");
});
