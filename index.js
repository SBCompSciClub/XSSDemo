let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let sha256 = require('js-sha256').sha256;
let auth = require('express-basic-auth');

let messages = [];

function passwordChecker(username, password){
	return username === "admin" && sha256(password) === "2492008b9a71e79b01f2281a8ab726f723204f07aceb541eddbb9ed60d813a06";
}

app.use(express.static('res'));
app.use('/admin', auth({
	authorizer: passwordChecker
}));

app.all('/', (req, res)=>{
	res.sendFile(__dirname + "/index.html");
});
app.post('/admin', (req, res)=>{
	res.sendFile(__dirname + "/admin.html");
});
app.all('/login', (req, res)=>{
	res.sendFile(__dirname + "/login.html");
});
app.all('/winner', (req, res)=>{
	res.sendFile(__dirname + "/winner.html");
});

io.on('connection', (socket)=>{
	console.log('User connected');
	socket.on('disconnect', (socket)=>{
		console.log('User disconnected');		
	});
	socket.on('message_sent', (message)=>{
		//messages.push(message);
		io.emit("message_received", message);
		if(XSSFilter(message)){
			io.emit('message_approved', `${message.username}: ${message.body}`);
		} else {
			io.emit('message_approved', "<-- FAILED MESSAGE -->");
		}
	});
});

http.listen( (process.env.PORT || 8080), ()=>{
	console.log("Main page working");
});

function XSSFilter(message){
	let u = message.username.toLowerCase();
	let b = message.body.toLowerCase();
	//Check for HTML tags:
	let tagRegex = new RegExp('(<.*>)|(>.*<)');
	if(tagRegex.test(u) || tagRegex.test(b)){
		return false;
	}

	//Check for URL Redirects
	let httpRegex = new RegExp('(http)|(www)|(href)|(src)');
	if(httpRegex.test(u) || httpRegex.test(b)){
		return false;
	}
	return true;
}
