var socket = io("localhost:10059");
var ajRooms=[];
$(document).ready(function(e){
	socket.emit("room list", {});
	socket.on("room list", function(jData){
		ajRooms = jData.ajRooms;
		$("#listTable").find( "tr:gt(0)" ).remove();
		for(var i=0; i<ajRooms.length; i++){
			$("#listTable").append("<tr><td>"+ajRooms[i].name+"</td><td>"+ajRooms[i].numberPlayers+"/4</td><td>"+ajRooms[i].type+"</td><td>"+ajRooms[i].time+"</td><td><button>Join</button></td></tr>");
		}
	});
	var passInput = document.getElementById('password');
	var createDiv = document.getElementById('createDiv');
	passInput.style.display = 'none';
	createDiv.style.display = 'none';
	$("#create").click(function(){
	    if (createDiv.style.display === 'none') {
	        createDiv.style.display = 'block';
	    } else {
	        createDiv.style.display = 'none';
	    	socket.emit("create", {"name":$("#name").val(),"pass":$("#password").val()});
	    	socket.emit("room list", {});
	    	// socket.emit("Join", {"user":user, "room":room});	
	    }
	});
	$("#type").change(function(){
		if (passInput.style.display === 'none') {
	        passInput.style.display = 'block';
	    } else {
	    	$("#password").val('');
	        passInput.style.display = 'none';
	    }
	});
});