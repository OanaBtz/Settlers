var socket = io("localhost:10059");
$(document).ready(function(e){
	$("#btnLog").click(function(){
		var sName = $("#name").val();
		var sPass = $("#pass").val();
		socket.emit("login", {"name":sName,"password":sPass});
		socket.on("ok", function(jData){
			window.location.href = "/success";	
		});
	});
	$("#btnRegister").click(function(){
		window.location.href = "/register";
	});
});