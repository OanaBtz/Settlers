console.log("pula");
var socket = io("localhost:10059");
$(document).ready(function(e){
	$("#btnSave").click(function(){
		var sName = $("#name").val();
		var sPass = $("#pass").val();
		socket.emit("save", {"name":sName,"password":sPass});
		socket.on("ok", function(jData){
			window.location.href = "/login";
		});
	});
});