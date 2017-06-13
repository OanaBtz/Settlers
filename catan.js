// ----- Canvas globals -----

var mapCanvas;
var drawingContext;

var canvasCenterX;
var canvasCenterY;

// ----- Hexagon drawing parameters -----

var mapStyle = "retro";

var size = null;
var defaultFillStyle = "#ffffff";
var strokeStyle = "#000000";
var lineWidth = 3;
var resourceTypeToColor = {
    "ore": "#363636",
    "clay": "#E83200",
    "wool": "#98E82E",
    "wood": "#0A7300",
    "grain": "#E0E000",
    "desert": "#F2F0A0",
    "none": "#ffffff"
};
var resourceTypeToImageCanvas = {
    "ore": null,
    "clay": null,
    "wool": null,
    "wood": null,
    "grain": null,
    "desert": null
};

// ----- Grid layout globals -----

// dx = size * (cos0 + cos60)/2 = size* 3/4; 
// dy = size * si60 = size* sqrt(3)/2
var dx = size * (1 + Math.cos(Math.PI/3)) / 2;
var dy = size * Math.sin(Math.PI/3);




// ----- Map definition globals -----




var catanMap = new CatanMap();
var map = new MapDefinition();
var points = [];
var roads = [];
var hexTiles = [];

map.resources = {
	"desert": 1,
	"wood": 4,
	"clay": 3,
	"wool": 4,
	"grain": 4,
	"ore": 3
};
map.numbers = {
	2: 1,
	3: 2,
	4: 2,
	5: 2,
	6: 2,
	8: 2,
	9: 2,
	10: 2,
	11: 2,
	12: 1
}
map.coordinatesArray = [
	[-4,2],[-4,0],[-4,-2],
	[-2,3],[-2,1],[-2,-1],[-2,-3],
	[0,4],[0,2],[0,0],[0,-2],[0,-4],
	[2,3],[2,1],[2,-1],[2,-3],
	[4,2],[4,0],[4,-2]
];

//----------- Victory points and resources */

var iVictoryPoints = 0,
	hVictoryPoints = $('#points'),
	hDice1 = $('#dice1'),
	hDice2 = $('#dice2'),
	iRollSum;
var hWood = $("#lblWood");
var iWood = 4;
var hBrick = $("#lblBrick");
var iBrick = 4;
var hRock = $("#lblRock");
var iRock = 0;
var iGrain = 2;
var hGrain = $("#lblGrain");
var iWool = 2;
var hWool = $("#lblWool");

hWood.text(iWood);
hWool.text(iWool);
hRock.text(iRock);
hGrain.text(iGrain);
hBrick.text(iBrick);
//**********************Functions************************

function roll(){
	var iDice1 = Math.floor(Math.random() * 6) + 1;
	hDice1.text(iDice1);
	var iDice2 = Math.floor(Math.random() * 6) + 1;
	hDice2.text(iDice2);
	iRollSum = iDice1 + iDice2;
	for(var i=0;i<19;i++){
		if(hexTiles[i].number==iRollSum){
			for(var j=0;j<6;j++){
				if(hexTiles[i].points[j].building == "house"){
					if(hexTiles[i].resourceType == "clay"){
						console.log(hexTiles[i].resourceType);
						iBrick++;
						hBrick.text(iBrick);
					}
					if(hexTiles[i].resourceType == "hay"){
						console.log(hexTiles[i].resourceType);
						iGrain++;
						hGrain.text(iGrain);
					}
					if(hexTiles[i].resourceType == "ore"){
						console.log(hexTiles[i].resourceType);
						iRock++;
						hRock.text(iRock);
					}
					if(hexTiles[i].resourceType == "wool"){
						console.log(hexTiles[i].resourceType);
						iWool++;
						hWool.text(iWool);
					}
					if(hexTiles[i].resourceType == "wood"){
						console.log(hexTiles[i].resourceType);
						iWood++;
						hWood.text(iWood);
					}
				}
				else if(hexTiles[i].points[j].building == "city"){
					if(hexTiles[i].resourceType == "clay"){
						iBrick= iBrick+2;
						$("#lblBrick").text(iBrick);
					}
					if(hexTiles[i].resourceType == "hay"){
						iGrain= iGrain+2;
						$("#lblGrain").text(iGrain);
					}
					if(hexTiles[i].resourceType == "ore"){
						iRock=iRock+2;
						$("#lblRock").text(iRock);
					}
					if(hexTiles[i].resourceType == "wool"){
						iWool=iWool+2;
						$("#lblWool").text(iWool);
					}
					if(hexTiles[i].resourceType == "wood"){
						iWood=iWood+2;
						$("#lblWood").text(iWood);
					}
				}
			}
			
		}
	}
	console.log(iRollSum);
}

function init() {

    loadImages(function () {
        generate();
    });
    addCanvas();
}

function CatanMap() {
	
	this.mapDefinition = null;
	this.hexTiles = null;
	this.coordToTile = {};
	this.coordSpan = [0,0];
	
}

function MapDefinition() {
	this.resources = null;
	this.numbers = null;
	this.coordinatesArray = null;
}


function addCanvas() {
	//$(mapCanvas).attr("width", 600);
	//$(mapCanvas).attr("height", 400);
	mapCanvas = document.createElement("canvas");
	drawingContext = mapCanvas.getContext('2d');
	mapCanvas.id = "map-canvas";
	sizeCanvas();
	
	document.getElementById("map-container").appendChild(mapCanvas);	
}

function sizeCanvas() {
    var mapContainer = $("div#map-container")[0];
    $(mapCanvas).attr("width", $(mapContainer).width());
    $(mapCanvas).attr("height", $(mapContainer).height());
    canvasCenterY = mapCanvas.height / 2;
    canvasCenterX = mapCanvas.width / 2;
}


function generate() {	
	catanMap.defineMap(map);
	catanMap.generate();
	catanMap.resize();
	catanMap.draw();
}


CatanMap.prototype.defineMap = function(mapDefinition) {
	
	if (mapDefinition.checkValidity()) {
		
		this.mapDefinition = mapDefinition;
		this.coordSpan = [8,8];
		
	} else {
		console.log("Invalid map definition.");
	}
}

MapDefinition.prototype.checkValidity = function() {
	var cArrLen = this.coordinatesArray.length;
	var resSum = this.sumValues(this.resources);
	var nrSum = this.sumValues(this.numbers);
	
	return (cArrLen == resSum) && (resSum == (nrSum + 1));
	// +1 is the desert card
}

MapDefinition.prototype.sumValues = function(mapDefinitor) {
	var sum = 0;
	for (var key in mapDefinitor) {
		sum += mapDefinitor[key];
	}
	return sum;
}

CatanMap.prototype.generate = function() {
	
	if (this.mapDefinition) {
		
		this.hexTiles = [];
		
		var numTiles = 19;
		
		var tileCoordinates = this.mapDefinition.coordinatesArray.copy();
		
		var tileNumbers = [];
		for (var key in this.mapDefinition.numbers) {
			for (var i = 0; i < this.mapDefinition.numbers[key]; i ++) {
				tileNumbers.push(parseInt(key));
			}
		}
		
		var tileTypes = [];
		for (var key in this.mapDefinition.resources) {
			if (key != "desert") {
				for (var i = 0; i < this.mapDefinition.resources[key]; i ++) {
					tileTypes.push(key);
				}
			}
		}
		
		var newCoords = null;
		
		// define the desert first on a random position with the type desert but with no number

		var desertHexTile = new HexTile();
		newCoords = tileCoordinates.random(true);
		desertHexTile.setCoordinate.apply(
			desertHexTile,
			newCoords
		);
		desertHexTile.setResourceType("desert");
		//push the desert to the array
		this.hexTiles.push(desertHexTile);
		hexTiles.push(desertHexTile);
		this.coordToTile[newCoords.toString()] = desertHexTile;
		


		// Move all highly productive tile number (6 and 8) to the front
		// of the tileNumbers array
		var highlyProductiveIdx = [];
		highlyProductiveIdx = highlyProductiveIdx.concat(
			tileNumbers.indexOfArray(6),
			tileNumbers.indexOfArray(8)
		);
		for (var i = 0; i < highlyProductiveIdx.length; i ++) {
			tileNumbers.swap(i,highlyProductiveIdx[i]);
		}


		
		// Handle all other tiles
		for (var i = 0; i < (numTiles - 1); i ++) {
			
			var newHexTile = new HexTile();
			newHexTile.setNumber(tileNumbers[i]);
			newHexTile.setResourceType(tileTypes.random(true));

			var invalid;
			
			if ( newHexTile.isHighlyProductive() ) {
				var tmpCoords = [];
				do {
					newCoords = tileCoordinates.random(true);
					newHexTile.setCoordinate.apply(
						newHexTile,
						newCoords
					);
					// 2 highly productive hexagons can`t be neighbors
					invalid = this.hasHighlyProductiveNeighbors(newHexTile);
					if (invalid) {
						tmpCoords.push(newCoords);
					}
				} while ( invalid );
				tileCoordinates = tileCoordinates.concat(tmpCoords);
			} else {
				newCoords = tileCoordinates.random(true);
				newHexTile.setCoordinate.apply(
					newHexTile,
					newCoords
				);
			}
			
			this.hexTiles.push(newHexTile);
			hexTiles.push(newHexTile);
			this.coordToTile[newCoords.toString()] = newHexTile;
		} // end for loop
		
	} else {
		console.log("No map definition.");
	}
	
}

function HexTile() {
	this.gridX;
	this.gridY;
	this.xCenter;
	this.yCenter;
	this.resourceType = "none";
	this.fillStyle = defaultFillStyle;
	this.number;
	this.points = [];
	this.roads = [];
}

HexTile.prototype.strokeStyle = strokeStyle;
HexTile.prototype.lineWidth = lineWidth;
HexTile.prototype.hexColorMap = resourceTypeToColor;
HexTile.prototype.size = size;

HexTile.prototype.setResourceType = function(resourceType) {
	if (this.hexColorMap[resourceType]) {
		this.resourceType = resourceType;
		this.fillStyle = this.hexColorMap[resourceType];
	} else {
		console.log("Unrecognized resource type:",resourceType);
	}
}

HexTile.prototype.isHighlyProductive = function() {
	return ( (this.number == 6) || (this.number == 8) );
}

CatanMap.prototype.hasHighlyProductiveNeighbors = function(tile) {
	var adjacentTiles = this.getAdjacentTiles(tile);
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if ( adjacentTiles[i].isHighlyProductive() ) {
			return true;
		}
	}
	return false;
}
HexTile.prototype.setNumber = function(number) {
	this.number = number;
}
HexTile.prototype.setCoordinate = function (x, y) {
    this.gridX = x;
    this.gridY = y;
}



CatanMap.prototype.draw = function() {

	if (this.hexTiles) {
		drawingContext.clear();
		for (var i = 0; i < this.hexTiles.length; i ++) {
			this.hexTiles[i].draw();
		}
	}
	clearPoints();
}


HexTile.prototype.draw = function() {
	this.xCenter = canvasCenterX + dx*this.gridX;
	//console.log(this.xCenter);
	this.yCenter = canvasCenterY + dy*this.gridY;
	//console.log(this.yCenter);
	this.drawBase();
	// Don't draw number if desert
	if (this.number) {
		this.drawNumber();
	}
	this.findPoints();
	this.findRoads();
}

function Road(ax,ay,bx,by,onbuild,building){
	this.ax = ax;
	this.ay = ay;
	this.bx = bx;
	this.by = by;
	this.onbuild = onbuild;
	this.building = building;
}

Road.prototype.setOnBuild = function(onbuild){
	this.onbuild = onbuild;
}
Road.prototype.setBuilding = function(building){
	this.building =building;
}



HexTile.prototype.drawBase = function() {
	if (mapStyle == "retro") {
		drawingContext.lineWidth = 5;
		drawingContext.fillStyle = "rgba(255,255,255,0)";
		drawingContext.strokeStyle = "#FAEB96";
	} else {
		drawingContext.lineWidth = this.lineWidth;
		drawingContext.fillStyle = this.fillStyle;
		drawingContext.strokeStyle = this.strokeStyle;
	}
	
	// Begin Path and start at top of hexagon

	var angleOffset = Math.PI / 6;
	drawingContext.beginPath();
	var ax= this.xCenter + size * Math.sin(angleOffset);
	var ay= this.yCenter - size * Math.cos(angleOffset);
	
	var bx;
	var by;
	drawingContext.moveTo (ax,ay);
	
	// Move clockwise and draw hexagon
	var newAngle;
	for (var i = 1; i <= 6; i ++) {
		newAngle = i * Math.PI / 3;

		bx = this.xCenter + size * Math.sin(newAngle + angleOffset);
		by = this.yCenter - size * Math.cos(newAngle + angleOffset);

		drawingContext.lineTo(bx,by);

		ax=bx;
		ay=by;
	}
	drawingContext.closePath();
	
	if (mapStyle == "retro") {
		
		var imgCanvas = resourceTypeToImageCanvas[this.resourceType];
		
		drawingContext.drawImage(
			imgCanvas,
			0, 0, imgCanvas.width, imgCanvas.height, 
			this.xCenter - size,
			this.yCenter - dy,
			2*size,
			2*dy
		);
		
	} else {
		drawingContext.fill();
	}
	
	drawingContext.stroke();
	
}

HexTile.prototype.drawNumber = function () {

    drawingContext.fillStyle = "#FFFFFF";
    drawingContext.strokeStyle = "#000000";
    drawingContext.lineWidth = 3;

    drawingContext.beginPath();
    drawingContext.arc(this.xCenter, this.yCenter, 0.375 * size,
        0, 2 * Math.PI, false);
    drawingContext.closePath();

    drawingContext.stroke();
    drawingContext.fill();


    var fontSizePt = Math.ceil(30 / 40 * (.45 * size - 8) + 6);

    drawingContext.font = "bold " + fontSizePt + "pt sans-serif";
    drawingContext.textAlign = "center";
    if (this.isHighlyProductive()) {
        drawingContext.fillStyle = "#FF0000";
    } else {
        drawingContext.fillStyle = "#000000";
    }
    drawingContext.fillText(
        this.number.toString(),
        this.xCenter,
        this.yCenter + Math.ceil(0.85 * fontSizePt / 2)
    );

}



// calc the mouseclick position and test if it's inside the rect
function handleMouseDown(event){
	
	var canvasOffset=$("#map-canvas").offset();
	var offsetX=canvasOffset.left;
	var offsetY=canvasOffset.top;
    // calculate the mouse click position
    mouseX=parseInt(event.clientX-offsetX);
    mouseY=parseInt(event.clientY-offsetY);

	var flag = false;

	console.log(hexTiles);
    for(var i=0; i<19; i++){
		var hexTile = hexTiles[i];
		for(var j=0;j<6;j++){
    
    	if(hexTile.points[j].isPointInside(mouseX,mouseY) && hexTile.points[j].building==null && hexTile.points[j].onbuild==true){
        	if(iBrick>=1 && iWood>=1 && iWool>=1 && iGrain>=1){
        		hexTile.points[j].setBuilding("house");
				flag = true;
        		drawHause(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius);
        	
        		x=hexTile.points[j].xCenter;
        		y=hexTile.points[j].yCenter;
        		iBrick--;
        		iWool--;
        		iWood--;
        		iGrain--;
        	}
        }else if(hexTile.points[j].isPointInside(mouseX,mouseY) && hexTile.points[j].building=="house" && hexTile.points[j].onbuild==true){
        	hexTile.points[j].setBuilding("city");
			flag = true;
        	drawCity(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius);
        	x=hexTile.points[j].xCenter;
        	y=hexTile.points[j].yCenter;
        }
        else if(hexTile.roads[j].isPointInside(mouseX,mouseY) && hexTile.roads[j].building==null && hexTile.roads[j].onbuild==true){
        	console.log(mouseX+" "+mouseY+" "+hexTile.roads[j].ax+" "+hexTile.roads[j].ay+" "+hexTile.roads[j].bx+" "+hexTile.roads[j].by);
        	hexTile.points[j].setBuilding("road");
        	drawRoad(hexTile.roads[j].ax, hexTile.roads[j].ay, hexTile.roads[j].bx, hexTile.roads[j].by);
        }
    }
    } 
	if (flag){
		iVictoryPoints++;
		hVictoryPoints.text(iVictoryPoints);
	}

    clearPoints();  
}



function drawHause(x,y,r){
	drawingContext.fillStyle="#42f480";
    drawingContext.strokeStyle="#0a3d21";
    drawingContext.lineWidth="2";
    //drawingContext.save();
    //Draw a triangle for the roof
    drawingContext.beginPath();
    drawingContext.moveTo(x-r-(r/2), y);
    drawingContext.lineTo(x, y-r-(r/2));
    drawingContext.lineTo(x+r+(r/2), y);
    drawingContext.closePath();
    drawingContext.fill();
    drawingContext.stroke();

    drawingContext.beginPath();
    drawingContext.rect(x-r, y, 2*r, r);
    drawingContext.closePath();
    drawingContext.fill();
    drawingContext.stroke();
}



function drawCity(x,y,r){

	drawingContext.fillStyle="#42f480";
    drawingContext.strokeStyle="#0a3d21";
    drawingContext.lineWidth="2";

    drawingContext.beginPath();

    drawingContext.rect(x-r-(r/2), y-r-(r/2), 2.5*r, 2.5*r);
    drawingContext.closePath();

    drawingContext.fill();
    drawingContext.stroke();

    drawingContext.beginPath();

    drawingContext.rect(x-2*r, y-r+(r/2), r, r+(r/2));
    drawingContext.closePath();

	drawingContext.fill();
    drawingContext.stroke();

    drawingContext.beginPath();

    drawingContext.rect(x+r-(r/2), y-r/2, r+(r/2), r+(r/2));
    drawingContext.closePath();

    drawingContext.fill();
    drawingContext.stroke();
}

function drawRoad(ax,ay,bx,by){
	drawingContext.fillStyle = "#adebad";
	drawingContext.strokeStyle = "#f44268";
	drawingContext.lineWidth = 3;
	
	drawingContext.beginPath();
				
	drawingContext.moveTo (ax,ay);
	drawingContext.lineTo (bx,by);

	drawingContext.closePath();
	drawingContext.stroke();
}

function Point(xCenter, yCenter, radius, startAngle, endAngle, counterclockwise, building, onbuild){
	this.xCenter = xCenter;
	this.yCenter = yCenter;
	this.radius = radius;
	this.startAngle = startAngle;
	this.endAngle = endAngle;
	this.counterclockwise = counterclockwise;
	this.building = building;
	this.onbuild = onbuild;
}

Point.prototype.isPointInside = function(x,y){
    var dx = this.xCenter-x;
    var dy = this.yCenter-y;
    return( dx*dx+dy*dy <= this.radius*this.radius );
}

Point.prototype.setBuilding = function( building ){
	this.building = building;
}
Point.prototype.setOnBuild = function(onbuild){
	this.onbuild = onbuild;
}

Road.prototype.isPointInside = function(x, y){    	
	if((x >= this.ax+0.5 && x <= this.ax-0.5) || (y >= this.ay+0.5 && y <= this.ay-0.5))
    	return( true);
    else
    	return(false);
}

HexTile.prototype.findPoints = function(){

	var radius = 0.140 * size;
	var startAngle = 0;
	var endAngle = 2*Math.PI;
	var counterclockwise = false;
	var building = null;
	var onbuild = false;

		var newAngle;
		for (var i = 1; i <= 11; i +=2 ) {
			newAngle = i* Math.PI / 6 ;
			
			var xCenter = this.xCenter + size * Math.sin(newAngle);
			var yCenter = this.yCenter - size * Math.cos(newAngle);

			var newPoint = new Point(xCenter, yCenter, radius, startAngle, endAngle, counterclockwise, building, onbuild);
			
			this.points.push(newPoint);
			//console.log(newPoint);
		
		}
}

HexTile.prototype.findRoads = function(){
	
	var angleOffset = Math.PI / 6;
	var ax= this.xCenter + size * Math.sin(angleOffset);
	var ay= this.yCenter - size * Math.cos(angleOffset);
	
	var bx;
	var by;
	var newAngle;
	for (var i = 1; i <= 6; i ++) {
		newAngle = i * Math.PI / 3;

		bx = this.xCenter + size * Math.sin(newAngle + angleOffset);
		by = this.yCenter - size * Math.cos(newAngle + angleOffset);
	
		var road = new Road(ax,ay,bx,by,false,null);
		this.roads.push(road);
		ax=bx;
		ay=by;
	}
}


function placeHause(){

	clearPoints();
	drawingContext.fillStyle = "#adebad";
	drawingContext.strokeStyle = "#33cc33";
	drawingContext.lineWidth = 1;

	for(var i=0; i<19; i++){
		var hexTile = hexTiles[i];
		for(var j=0;j<6;j++){
			if(hexTile.points[j].building == null){
			
				drawingContext.beginPath();
		
				drawingContext.arc(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius, hexTile.points[j].startAngle, hexTile.points[j].endAngle, hexTile.points[j].counterclockwise);
				drawingContext.closePath();
				drawingContext.stroke();
				drawingContext.fill();
				hexTile.points[j].setOnBuild(true);

			}
		}	
	}
	//console.log(points);
}

function placeCity(){
	clearPoints();
	for(var i=0; i<19; i++){
		var hexTile = hexTiles[i];
		for(var j=0;j<6;j++){
			if(hexTile.points[j].building == "house"){
				hexTile.points[j].setOnBuild(true);
			}
		}	
	}
	//console.log(points);
}

function placeRoad(){

	for(var i=0; i<19; i++){
		var hexTile = hexTiles[i];
		for(var j=0;j<6;j++){
			if(hexTile.roads[j].onbuild == false){
				if(hexTile.roads[j].ax>=hexTile.points[j].xCenter-0.5 || hexTile.roads[j].ax<=hexTile.points[j].xCenter+0.5){
					if(hexTile.points[j].building == "house" || hexTile.points[j].building == "city"){
						console.log("i am here");
						drawingContext.lineWidth = 5;
						drawingContext.fillStyle = "rgba(255,255,255,0)";
						drawingContext.strokeStyle = "#33cc33";
			
						drawingContext.beginPath();
				
						drawingContext.moveTo (hexTile.roads[j].ax,hexTile.roads[j].ay);
						drawingContext.lineTo (hexTile.roads[j].bx,hexTile.roads[j].by);
						hexTile.roads[j].setOnBuild(true);
					}
				}
			}
			drawingContext.closePath();
			drawingContext.stroke();
			if(hexTile.points[j].building == "house")
				drawHause(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius);
			if(hexTile.points[j].building == "city")
				drawCity(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius);		
		}   	
	}
}

function clearPoints(){

	drawingContext.fillStyle = "#FAEB96";
	drawingContext.strokeStyle = "#FAEB96";
	drawingContext.lineWidth = 1;
	//var radius = 0.0 * size;

	for(var i=0; i<19; i++){
		var hexTile = hexTiles[i];
		for(var j=0;j<6;j++){
			if(hexTile.points[j].building == null){
				drawingContext.beginPath();
		
				drawingContext.arc(hexTile.points[j].xCenter, hexTile.points[j].yCenter, hexTile.points[j].radius, hexTile.points[j].startAngle, hexTile.points[j].endAngle, hexTile.points[j].counterclockwise);
				drawingContext.closePath();
				drawingContext.stroke();
				drawingContext.fill();	
				hexTile.points[j].setOnBuild(false);
			}
			hexTile.points[j].setOnBuild(false);
		}
	}

}

CatanMap.prototype.resize = function() {
/* Size = Height / ( (coordSpacing + 2) * Math.sin(Math.PI/3) )
 * Size = Width / ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 )
*/
	var wSize = (mapCanvas.width-10) / 
		( (this.coordSpan[0] * (1 + Math.cos(Math.PI/3)) / 2) + 2 );
	var hSize = (mapCanvas.height-10) / 
		( (this.coordSpan[1] + 2) * Math.sin(Math.PI/3) );
	size = Math.floor(Math.min(wSize, hSize));
	dx = size * (1 + Math.cos(Math.PI/3)) / 2;
	dy = size * Math.sin(Math.PI/3);
}


function loadImages(callback) {

	var rTypes = [];
	var imgPaths = [];
	for (var key in resourceTypeToImageCanvas) {
		rTypes.push(key);
		imgPaths.push("images/"+key+".png");
	}
	
	preloadImages(imgPaths, function(images) {
		
		for (var i = 0; i < imgPaths.length; i += 1) {
			//resourceTypeToImage[ rTypes[i] ] = images[i];
			var img = images[i];
			var imgCanvas = document.createElement("canvas");
			var imgContext = imgCanvas.getContext("2d");
			
			imgCanvas.width = img.width;
			imgCanvas.height = img.height;
			imgContext.drawImage(img, 0, 0);
			
			resourceTypeToImageCanvas[ rTypes[i] ] = imgCanvas;
		}
		
		callback();
		
	});
	
}

 function preloadImages(arr, callback){
// 	//http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml
	
    var newimages=[], loadedimages=0;
    var postaction=function(){};
    var arr=(typeof arr!="object")? [arr] : arr;
    function imageloadpost(){
        loadedimages++;
        if (loadedimages==arr.length){
            callback(newimages); //call postaction and pass in newimages array as parameter
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image();
        newimages[i].src=arr[i];
        newimages[i].onload=function(){
            imageloadpost();
        }
        newimages[i].onerror=function(){
            imageloadpost();
        }
    }

}

CatanMap.prototype.getAdjacentTiles = function(tile) {
	
	var tileX = tile.gridX;
	var tileY = tile.gridY;
	
	var adjTiles = [];
	
	// (+0,+2), (+2,+1), (+2,-1), (+0,-2), (-2,-1), (-2,1)
	xshift = [0, 2, 2, 0, -2, -2];
	yshift = [2, 1, -1, -2, -1, 1];
	
	for (var i = 0; i < 6; i += 1) {
		var adjTile = this.coordToTile[
			[tileX + xshift[i], tileY + yshift[i]].toString()
		];
		// Will be null if no hex tile found at that coordinate
		if (adjTile) {
			adjTiles.push(adjTile);
		}
	}
	
	return adjTiles;
	
}


Array.prototype.random = function(removeElem) {
	var idx = Math.floor(Math.random() * this.length);
	var val = this[idx];
	if (removeElem) {
		this.splice(idx,1);
	}
	return val;
}
Array.prototype.copy = function () {
    return this.slice();
}
Array.prototype.indexOfArray = function (val) {
    var arr = [];
    var sIdx = 0;
    var tmpCopy = this.copy();
    do {
        var rIdx = tmpCopy.indexOf(val);
        var valid = (rIdx >= 0);
        if (valid) {
            tmpCopy.splice(0, rIdx + 1);
            arr.push(sIdx + rIdx);
            sIdx += rIdx + 1;
        }
    } while (valid);
    return arr;
}
Array.prototype.swap = function (idx1, idx2) {
    var tmp = this[idx1];
    this[idx1] = this[idx2];
    this[idx2] = tmp;
}

// http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
CanvasRenderingContext2D.prototype.clear =
    CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
        if (preserveTransform) {
            this.save();
            this.setTransform(1, 0, 0, 1, 0, 0);
        }

        this.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (preserveTransform) {
            this.restore();
        }
    };

//**************************CHAT*****************************

$(function () {
        var socket = io();

        $('form').submit(function(){
            socket.emit('chat message', $('#m').val());
            var msg= $('#m').val();
     
            var img = '<img src="images/girl.png"/>';
        	$('.discussion').append($('<li class="self"> <div class="avatar"> '+img+' </div> <div class="messages">'+'<p>'+msg+'</p>'));
    		$('#m').val('');
            return false;
        });
        socket.on('chat message', function(msg){

        	var img = '<img src="images/girl.png"/>';
        	$('.discussion').append($('<li class="other"> <div class="avatar"> '+img+' </div> <div class="messages">'+'<p>'+msg+'</p>'));
        	
        });

});
