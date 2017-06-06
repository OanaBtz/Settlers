$(document).ready(function(e){
	$("#btnLog").click(function(){
		var sName = $("#name").val();
		var sPass = $("#pass").val();
		$.ajax({
		  type: "POST",
		  url: "login",
		  data: {"name":sName,"password":sPass}
		});
		// socket.emit("login", {"name":sName,"password":sPass});
		// socket.on("ok", function(jData){
		// 	window.location.href = "/roomList";	
		// });
	});
	$("#btnSave").click(function(){
		var sName = $("#nameReg").val();
		var sPass = $("#passReg").val();
		$.ajax({
		  type: "POST",
		  url: "localhost:10059/register",
		  data: {"name":sName,"password":sPass},
		  success: function(){
        		sName = $("#nameReg").val("");
				sPass = $("#passReg").val("");
				loginDiv.style.display = 'block';
	    		registerDiv.style.display = 'none';
    			}
		});
	});
	var loginDiv = document.getElementById('loginDiv');
	var registerDiv = document.getElementById('registerDiv');
	loginDiv.style.display = 'block';
	registerDiv.style.display = 'none';
	$("#btnRegister").click(function(){
	    loginDiv.style.display = 'none';
	    registerDiv.style.display = 'block';
	});
	$("#back").click(function(){
	    loginDiv.style.display = 'block';
	    registerDiv.style.display = 'none';
	})
});