var ajRooms=[];
$(document).ready(function(e){
	var passInput = document.getElementById('password');
	var createDiv = document.getElementById('createDiv');
	passInput.style.display = 'none';
	createDiv.style.display = 'none';
	ajRooms=$.ajax({
  		method: "GET",
  		url: "/all-rooms"
  	}).done(function(  ) {
    	$("#listTable").find( "tr:gt(0)" ).remove();
		for(var i=0; i<ajRooms.length; i++){
			$("#listTable").append("<tr><td>"+ajRooms[i].name+"</td><td>"+ajRooms[i].numberPlayers+"/4</td><td>"+ajRooms[i].type+"</td><td>"+ajRooms[i].time+"</td><td><button>Join</button></td></tr>");
		}
  	});
	$("#create").click(function(){
	    if (createDiv.style.display === 'none') {
	        createDiv.style.display = 'block';
	    } else {
	        createDiv.style.display = 'none';
	    	socket.emit("create", {"name":$("#name").val(),"pass":$("#password").val()});
	    	socket.emit("room list", {});
	    	$("input").val('');

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