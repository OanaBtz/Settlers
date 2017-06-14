var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('client-sessions');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = mongoose.model("User", new Schema({
	id: ObjectId,
	firstName: String,
	lastName: String,
	email: {type: String, unique: true},
	password: String
}));
var Room = mongoose.model("Room", new Schema({
	id: ObjectId,
	roomName: String,
	players: [],
	password: String
}));

var ajRooms = [];
var roomSockets = [];

app.use(express.static(__dirname + '/'));

io.on('connection', function (socket) {

    socket.on('chat message', function (msg) {
        // io.emit('chat message', msg);
        socket.broadcast.emit('chat message', msg);
    });
});
//io.emit('some event', { for: 'everyone' }); this sents a message to everyone
var roomListSocket = io.of('/room-list');
roomListSocket.on('connection', function(socket){
	
	// socket.on('new room', function(data){
	// 	console.log(data);
	// 	var room = new Room({
	// 		roomName: data.name,
	// 		players:[].push(req.session.user),
	// 		password:data.password
	// 	});
	// 	room.save(function(err){
	// 		if(err){
	// 			var err="something bad happened";
	// 			if(err.code==11000){
	// 				err="Something happened";
	// 			}
	// 		}
	// 		else{}
	// 	});
	// 	socket.emit('all rooms', Room.find());	
	// 	io.of('/room/'+room.id).on('connection', function(socket){
	// 		//interactions to be put here
	// 	});
	// });

	socket.on('get all rooms', function(data){
		socket.emit('all rooms', Room.find());
	});

});

mongoose.connect("mongodb://localhost/newauth");
//middleware

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser({uploadDir:'../images/uploads'}));

app.use(session({
	cookieName:"session", 
	//encryption key
	secret:"fdjvnpbpdsbnp h9tffffbgv12304j12po'[p;'sd;f]ds[gvs[k,pfds",
	duration:60*60*1000,
	//how much it extends everytime you are close to finishing
	activeDuration:5*60*1000
}));

app.get("/register", function(req, res){
	res.sendFile(__dirname+"/views/register.html");
});

app.post("/register", function(req, res){
	var user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
	});
	user.save(function(err){
		if(err){
			var err="something bad happened";
			if(err.code==11000){
				error="that email is already taken, try again";
			}
			res.sendFile(__dirname+"/views/register.html");
		}
		else
			res.redirect('/');
	});
});

app.get("/login", function(req, res){
	res.sendFile(__dirname+"/views/login.html");
});

app.post("/login", function(req, res){
	User.findOne({email:req.body.email}, function(err, user){
		if(!user)
			res.send("Invalid email or password");
		else
			if(req.body.password==user.password){
				req.session.user=user; //returns the cookie with the response
				res.redirect('/room-list');
			}
			else
				res.send("Invalid email or password");
	})
})

app.get("/room-list", function(req, res){
	if(req.session && req.session.user){
		User.findOne({email:req.session.user.email}, function(err, user){
			if(!user){
				req.session.reset();
				res.redirect('/');
			}
			else{
				res.sendFile(__dirname+"/views/roomList.html")
			}
		});
	}else{
		res.redirect('/');
	}
});

app.get('/room/:id', function (req, res) {
	if(req.session && req.session.user){
		User.findOne({email:req.session.user.email}, function(err, user){
			if(!user){
				console.log("Error: User not found.");
				req.session.reset();
				res.redirect('/login');
			}
			else{
				Room.findById(req.params.id, function(err, room){
					if(!room){}
					else
						if(!room.players.indexOf(req.user)){
							console.log("This user has not joined the room");
						}
						else{}
							res.sendFile(__dirname+"/index.html");
				})
				
			}
		});
	}else{
		console.log("Error: You are not logged in.");
		res.redirect('/login');
	}
	res.sendFile(__dirname+"/index.html");
});

app.get("/roomId", function(req, res){
	if(req.session && req.session.user){
		Room.find({players:req.session.user}, function(err, room){
			if(!room){console.log("Room not found in DB");}
			else{
				res.send(room.id);
			}
		})
	}else{console.log("Error: No current session");}
});

app.get("/join/:id", function(req, res){
	var room = Room.findById(req.params.id);
	room.players.push(req.session.user);
	Room.findByIdAndUpdate(room.id, room);
	res.redirect("/room/"+room.id);
});

app.get("/logout", function(req, res){
	req.session.reset();
	res.redirect("/");
});


function newRoomSocket(){

}

http.listen(2000, function () {
    console.log('listening on *:2000');
});