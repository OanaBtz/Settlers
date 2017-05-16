var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;

var sUrl = "mongodb://localhost:27017/game";
var ajRooms = [{"name":"example","numberPlayers":3,"type":"Private","password":"pass","time":"19:23"},{"name":"example","numberPlayers":3,"type":"Private","password":"pass","time":"19:23"}];

app.use(express.static(__dirname+"/"));


mongo.connect(sUrl, function(error, oDb){
	oDb.createCollection("users", function(error, cUsers){
	});

});
//Create the sockets server
var server = require("http").Server(app);
var io = require("socket.io")(server);
var date = new Date();



app.get("/login", function(req, res){
	res.sendFile(__dirname+"/login.html");
});


app.get("/register", function(req, res){
	res.sendFile(__dirname+"/register.html");
});

app.get("/success", function(req, res){
	res.sendFile(__dirname+"/success.html");
});

app.get("/room-list", function(req, res){
	res.sendFile(__dirname+"/roomList.html");
});




io.on("connection", function(oSocket){
	console.log("A client connected.");

	//sends to the everyone
	
	oSocket.on("save", function(jData){
		mongo.connect(sUrl, function(error, oDb){
			var oUsers = oDb.collection('users');
			oUsers.find({"name":jData.name}).toArray(function(err, ajUsers){
				if(ajUsers.length==0){
					oDb.collection("users").insert(jData);
					oSocket.emit("ok",{});
				}
			});
		});
		oSocket.emit("ok");
	});
	oSocket.on("login", function(jData){
		mongo.connect(sUrl, function(error, oDb){
			var oUsers = oDb.collection('users');
			oUsers.find({"name":jData.name, "password":jData.password}).toArray(function(err, ajUsers){
				if(ajUsers.length==1)
					oSocket.emit("ok",{});
			});
		});
	});
	oSocket.on("room list", function(jData){
		console.log("Room list requested, sending...");
		io.emit("room list", {ajRooms});
	});
	oSocket.on("create", function(jData){
		console.log("creating new room made by "+jData.name);
		if(jData.pass=="")
			ajRooms.push({"name":jData.name,"numberPlayers":1,"type":"Public"});
		else
			ajRooms.push({"name":jData.name,"numberPlayers":1,"type":"Private","password":jData.pass});
	});
});



/************************************************************/
server.listen(10059, function(){
	console.log("Server running on port 10059.");
});