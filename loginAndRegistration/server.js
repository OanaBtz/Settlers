var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;

var sUrl = "mongodb://localhost:27017/game";


app.use(express.static(__dirname+"/"));


mongo.connect(sUrl, function(error, oDb){
	oDb.createCollection("users", function(error, cUsers){
	});

});
//Create the sockets server
var server = require("http").Server(app);
var io = require("socket.io")(server);




app.get("/login", function(req, res){
	res.sendFile(__dirname+"/login.html");
});


app.get("/register", function(req, res){
	res.sendFile(__dirname+"/register.html");
});

app.get("/success", function(req, res){
	res.sendFile(__dirname+"/success.html");
})

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
});



/************************************************************/
server.listen(10059, function(){
	console.log("Server running on port 10059.");
});