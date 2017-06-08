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



app.get('/', function (req, res) {
	// if(req.session && req.session.user){
	// 	User.findOne({email:req.session.user.email}, function(err, user){
	// 		if(!user){
	// 			req.session.reset();
	// 			res.redirect('/login');
	// 		}
	// 		else{
	// 			console.log(res.locals.user);
	// 			res.sendFile(__dirname+"/index.html")
	// 		}
	// 	});
	// }else{
	// 	res.redirect('/login');
	// }
	res.sendFile(__dirname+"/index.html");
});

app.use(express.static(__dirname + '/'));

io.on('connection', function (socket) {

    socket.on('chat message', function (msg) {
        // io.emit('chat message', msg);
        socket.broadcast.emit('chat message', msg);
    });
});
//io.emit('some event', { for: 'everyone' }); this sents a message to everyone



mongoose.connect("mongodb://localhost/newauth");
//middleware

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
	cookieName:"session", 
	//encryption key
	secret:"fdjvnpbpdsbnp h9tffffbgv12304j12po'[p;'sd;f]ds[gvs[k,pfds",
	duration:60*60*1000,
	//how much it extends everytime you are close to finishing
	activeDuration:5*60*1000
}));


app.get("/home", function(req, res){
	res.sendFile(__dirname+"/views/index.html");
});

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
			res.redirect('/login');
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
				res.redirect('/login');
			}
			else{
				res.locals.user=user;
				res.locals.user = JSON.stringify(user);
				console.log(res.locals.user);
				res.sendFile(__dirname+"/views/roomList.html")
			}
		});
	}else{
		res.redirect('/login');
	}
});

app.get("/all-rooms", function(req, res){
	// if(req.session && req.session.user){
	// 	User.findOne({email:req.session.user.email}, function(err, user){
	// 		if(!user){console.log("User from session not found in database");}
	// 		else{
	// 			ajRooms=Room.find();
	// 			res.JSON(ajRooms);
	// 		}
	// 	});
	// }else{
	// 	console.log("Session and/or session user not found");
	// }
	ajRooms=Room.find();
	res.JSON(ajRooms);
})

app.post("/new-room", function(req, res){
	var room = new Room({
		roomName: req.body.roomName,
		player1:[].push(req.session.user),
		password:req.body.password
	});
	room.save(function(err){
		if(err){
			var err="something bad happened";
			if(err.code==11000){
				error="that email is already taken, try again";
			}
			res.sendFile(__dirname+"/views/register.html");
		}
		else
			res.redirect('/login');
	});
});

app.get("/joinRoom/:id", function(req, res){
	var room = Room.findById(req.params.id);
	room.players.push(req.session.user);
	Room.findByIdAndUpdate(room.id, room);
});

app.get("/room/:id", function(req, res){
	res.sendFile("index.html");
});


app.get("/logout", function(req, res){
	req.session.reset();
	res.redirect("/login");

});
http.listen(2000, function () {
    console.log('listening on *:2000');
});