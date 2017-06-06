var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost/user-db'); // connect to database
User = require('./userModel.js');
var session = require('client-sessions');
// var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./config'); // get our config file
// var User   = require('./app/models/user'); // get our mongoose model

var sUrl = "mongodb://localhost:27017/game";
var ajRooms = [{"name":"example","numberPlayers":3,"type":"Private","password":"pass","time":"19:23"},{"name":"example","numberPlayers":3,"type":"Private","password":"pass","time":"19:23"}];

var server = require("http").Server(app);
var io = require("socket.io")(server);
var date = new Date();

var port = process.env.PORT || 10059; // used to create, sign, and verify tokens
User = mongoose.model('User');

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));


//GETS
app.get("/login", function(req, res){
	res.sendFile(__dirname+"/login.html");
});

app.get("/success", function(req, res){
	res.sendFile(__dirname+"/success.html");
});

app.get("/room-list", function(req, res){
	if (req.session && req.session.user) { // Check if session exists
    // lookup the user in the DB by pulling their email from the session
	    User.findOne({ name: req.session.user.name, password: requ.session.ser.password }, function (err, user) {
	      if (!user) {
	        // if the user isn't found in the DB, reset the session info and
	        // redirect the user to the login page
	        req.session.reset();
	        res.redirect('/login');
	      } else {
	        // expose the user to the template
	        res.locals.user = user;
	 
	        // render the dashboard page
	        res.render('/room-list');
	      }
	    });
	}else {
    res.redirect('/login');
	}
});

//POSTS
app.post('/login', function(req, res) {
	User.findOne({ name: req.body.name }, function(err, user) {
	    if (!user) {
	    	res.render('login.html', { error: 'Invalid email or password.' });
	    }else {
	    	if (req.body.password === user.password) {
	        	// sets a cookie with the user's info
	        	req.session.user = user;
	        	res.redirect('/room-list');
	    	}else{
	        res.render('login.html', { error: 'Invalid email or password.' });
	      }
	    }
	});
});

app.post('/register', function(req, res){
	User.findOne({ name: req.body.name }, function(err, user) {
	    if (!user) {
	    	var newUser = new User(req.body);
	    	newUser.save(function(err, user){
	    		if(err)
	    			res.send(err);
	    		res.render('login.html');
	    	});
	    }else {
	    	if (req.body.name === user.name) {
	        	res.render('login.html', { error: 'Name is taken' });
	      	}
	    }
	});
})

app.use(express.static(__dirname+"/"));






// mongo.connect(sUrl, function(error, oDb){
// 	oDb.createCollection("users", function(error, cUsers){
// 	});

// });

// //Create the sockets server
// io.on("connection", function(oSocket){
// 	console.log("A client connected.");

// 	//sends to the everyone
	
// 	oSocket.on("save", function(jData){
// 		mongo.connect(sUrl, function(error, oDb){
// 			var oUsers = oDb.collection('users');
// 			oUsers.find({"name":jData.name}).toArray(function(err, ajUsers){
// 				if(ajUsers.length==0){
// 					oDb.collection("users").insert(jData);
// 					oSocket.emit("ok",{});
// 				}
// 			});
// 		});
// 		oSocket.emit("ok");
// 	});
// 	oSocket.on("login", function(jData){
// 		mongo.connect(sUrl, function(error, oDb){
// 			var oUsers = oDb.collection('users');
// 			oUsers.find({"name":jData.name, "password":jData.password}).toArray(function(err, ajUsers){
// 				if(ajUsers.length==1)
// 					oSocket.emit("ok",{});
// 			});
// 		});
// 	});
// 	oSocket.on("room list", function(jData){
// 		console.log("Room list requested, sending...");
// 		io.emit("room list", {ajRooms});
// 	});
// 	oSocket.on("create", function(jData){
// 		console.log("creating new room made by "+jData.name);
// 		if(jData.pass=="")
// 			ajRooms.push({"name":jData.name,"numberPlayers":1,"type":"Public"});
// 		else
// 			ajRooms.push({"name":jData.name,"numberPlayers":1,"type":"Private","password":jData.pass});
// 	});
// });



/************************************************************/
server.listen(port);


// // token use attempt, should have realized it is meant more single page application
// // Website: https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
// // =======================
// // routes ================
// app.set('superSecret', config.secret); // secret variable
// app.get('/setup', function(req, res) {

//   // create a sample user
//   var nick = new User({ 
//     name: 'Nick Cerminara', 
//     password: 'password',
//     admin: true 
//   });

//   // save the sample user
//   nick.save(function(err) {
//     if (err) throw err;

//     console.log('User saved successfully');
//     res.json({ success: true });
//   });
// });

// // =======================
// // basic route
// app.get('/', function(req, res) {
//     res.send('Hello! The API is at http://localhost:' + port + '/api');
// });

// // API ROUTES -------------------

// // get an instance of the router for api routes
// var apiRoutes = express.Router(); 

// // route to authenticate a user (POST http://localhost:8080/api/authenticate)
// apiRoutes.post('/authenticate', function(req, res) {

//   // find the user
//   User.findOne({
//     name: req.body.name
//   }, function(err, user) {

//     if (err) throw err;

//     if (!user) {
//       res.json({ success: false, message: 'Authentication failed. User not found.' });
//     } else if (user) {

//       // check if password matches
//       if (user.password != req.body.password) {
//         res.json({ success: false, message: 'Authentication failed. Wrong password.' });
//       } else {

//         // if user is found and password is right
//         // create a token
//         var token = jwt.sign(user, app.get('superSecret'), {
//           expiresIn: '1440m' // expires in 24 hours
//         });

//         // return the information including token as JSON
//         res.json({
//           success: true,
//           message: 'Enjoy your token!',
//           token: token
//         });
//       }   

//     }

//   });
// });

// // TODO: route middleware to verify a token

// apiRoutes.use(function(req, res, next) {

//   // check header or url parameters or post parameters for token
//   var token = req.body.token || req.query.token || req.headers['x-access-token'];

//   // decode token
//   if (token) {

//     // verifies secret and checks exp
//     jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
//       if (err) {
//         return res.json({ success: false, message: 'Failed to authenticate token.' });    
//       } else {
//         // if everything is good, save to request for use in other routes
//         req.decoded = decoded;    
//         next();
//       }
//     });

//   } else {

//     // if there is no token
//     // return an error
//     return res.status(403).send({ 
//         success: false, 
//         message: 'No token provided.' 
//     });

//   }
// });


// // route to show a random message (GET http://localhost:8080/api/)
// apiRoutes.get('/', function(req, res) {
//   res.json({ message: 'Welcome to the coolest API on earth!' });
// });

// // route to return all users (GET http://localhost:8080/api/users)
// apiRoutes.get('/users', function(req, res) {
//   User.find({}, function(err, users) {
//     res.json(users);
//   });
// });   

// // apply the routes to our application with the prefix /api
// app.use('/api', apiRoutes);
