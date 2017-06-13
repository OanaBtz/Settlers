var ajRooms=[];
var socket = io("/room-list");
$(document).ready(function(e){

	// var roomId=window.location.pathname.split('room/')[1];
	var passInput = document.getElementById('password');
	var createDiv = document.getElementById('createDiv');
	createDiv.style.display = 'none';
	function getAllRooms(){
		socket.emit("get all rooms", {});
		socket.on("all rooms", function(rooms){
			ajRooms=JSON.stringify(rooms);
			$("#listTable").find( "tr:gt(0)" ).remove();
			for(var i=0; i<ajRooms.length; i++){
				if(ajRooms[i].password=='')
					$("#listTable").append("<tr><td>"+ajRooms[i].name+"</td><td>"+ajRooms[i].players.length+"/4</td><td>Public</td><td></td><td><form method=\"get\" action=\"/join/"+ajRooms[i].id+"\"><button type=\"submit\">Join</button></form></td></tr>");
				else
					$("#listTable").append("<tr><td>"+ajRooms[i].name+"</td><td>"+ajRooms[i].players.length+"/4</td><td>Private</td><td></td><td><form method=\"get\" action=\"/join/"+ajRooms[i].id+"\"><button type=\"submit\">Join</button></form></td></tr>");
			}  
		});
	}
	getAllRooms();
	$("#create").click(function(){
		createDiv.style.display = 'block';
	});
	$("#refresh").click(function(){
		getAllRooms();
	})
	// $.get("/roomId", function(id, status){
	// 	roomId = id;
	// });
	$("#createForm").submit(function(){
		var name=document.getElementById('name').val();
		var pass=document.getElementById('password').val();
		socket.emit('new room', {'name': name, 'password':pass});
	});
});