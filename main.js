var timeSet = 60;
var turnCounter = 0;
var score = 0;
var money = 0;
var moneyPerTurn = 1;
var running = false;
var done = false;

var unitGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];
var buildingGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];

var costs = {
	"circle": 1,
	"square": 2,
	"star": 4,
	"hexagon": 5,
	"fractal": 10,
	"compass": 3,
	"scissors": 4,
	"inksplot": 7
}

var movementMode = false;
var buildingMode = false;
var move_row = 0;
var move_col = 0;
var currentUnit = "";
var unitsPlacedThisTurn = [];


var tick = setInterval(updateGrid, 100);
var scoreTick = setInterval(updateScore, 100);
var scoreHistory = "";

var f_resetTime = false;
var f_resetMoney = false;
var f_earlyEnd = false;

function makeTuple(a,b) {
	return [a,b];
}

// Updating Text and Information

function startTurn() {
	if (running == false) {
		if (turnCounter == 20) {
			document.getElementById("timerText").innerHTML = "GAME FINISHED!";
			done = true;
		}
		else {
			running = true;
			var time = timeSet;
			turnCounter += 1;
			document.getElementById("turnCounter").innerHTML = "TURN: " + turnCounter + " / 20";
			document.getElementById("start").value = "End Turn?";

			if (turnCounter == 6 || turnCounter == 11 || turnCounter == 16)
				moneyPerTurn += 1;
			money += moneyPerTurn;

			timerSetUp();

			var turnTimer = setInterval(timer, 1000);
			var moneyInterval = setInterval(moneyUpdate, 100);
		}

	}

	else if (running) {
		var result = confirm("Are you sure you want to end your turn early?");
		if (result) {
			f_earlyEnd = true;
		}
	}

	/// Turn Button Helper Functions

	function timerSetUp() {
		document.getElementById("timerText").innerHTML = time + " SECONDS";
	}

	function timer() {
		time -= 1;
		if (time <= 0 || f_resetTime || f_earlyEnd) {
			clearInterval(turnTimer);
			resetTime();

		} else {
			document.getElementById("timerText").innerHTML = time + " SECONDS";
			if (time <= 10)
				document.getElementById("timerText").style.color = "red";
		}
	}

	function moneyUpdate() {
		if (f_resetMoney) {
			clearInterval(moneyInterval);
			f_resetMoney = false;
		}
		else {
			moneyNextTurn = moneyPerTurn;
			if (turnCounter == 5 || turnCounter == 10 || turnCounter == 15)
				moneyNextTurn += 1;
			document.getElementById("moneyCount").innerHTML = "CURRENT INK: " + money + " (+" + moneyNextTurn + ")";
		}

	}
}

function updateGrid() {
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {

			var location = row.toString();
			location = location.concat(col.toString());
			var tile = document.getElementById(location);
			if (unitGrid[row][col] != "") {
				var path = "./img/" + unitGrid[row][col];
				path = path.concat(".png");
				var img = document.createElement("img");
				path.toLowerCase();
				img.src = path;
				if (tile.childNodes.length == 0)
					tile.appendChild(img);
				else if (tile.childNodes.length > 0)
					tile.childNodes[0].src = path;
			}
			else if (unitGrid[row][col] == "" && tile.childNodes.length > 0) {
				tile.removeChild(tile.childNodes[0]);
			}

			if (buildingGrid[row][col] != "" && tile.style.backgroundImage == "none") {
				var path = "./img/" + buildingGrid[row][col];
				path = path.toLowerCase();
				path = path.concat(".png");
				tile.style.backgroundImage = "url('" + path + "')"; 
			}
			else if (buildingGrid[row][col] == "" && tile.style.backgroundImage != "none")
				tile.style.backgroundImage = "none";

		}
	}
	if (movementMode && currentUnit != "") {
		location = move_row.toString();
		location = location.concat(move_col.toString());
		document.getElementById(location).style.border = "3px solid red";
		moves = findLegalMoves(move_row, move_col);
		for (i = 0; i < moves.length; i++) {
			var move_location = moves[i][0].toString();
			move_location = move_location.concat(moves[i][1].toString());
			document.getElementById(move_location).style.border = "3px solid green";
		}
	}
	if (!movementMode || (movementMode && currentUnit == "")) {
		location = move_row.toString();
		location = location.concat(move_col.toString());
		document.getElementById(location).style.border = "1px solid blue";
		moves = findLegalMoves(move_row, move_col);
		for (i = 0; i < 8; i++) {
			for (j = 0; j < 8; j++) {
				var move_location = i.toString();
				move_location = move_location.concat(j.toString());
				document.getElementById(move_location).style.border = "1px solid blue";
			}
		}
	}

}

function updateScore() {
	document.getElementById("scoreCount").innerHTML = "SCORE: " + score;
	if (score > 0)
		document.getElementById("score_history").innerHTML = scoreHistory + "<br>=" + score;
}

function addScore() {
	var inp = parseInt(document.getElementById("score_input").elements[0].value);
	if (isNaN(inp))
		alert("Must enter a number!");
	else if (inp + score < 0)
		alert("Cannot have a negative score!");
	else if (running)
		alert("Cannot add to score while turn is running!");
	else {
		score += inp;
		if (scoreHistory == "")
			scoreHistory = inp.toString() + "<br>";
		else if (inp < 0)
			scoreHistory = scoreHistory.concat( + inp.toString() + "<br>");
		else
			scoreHistory = scoreHistory.concat("+" + inp.toString() + "<br>");
	}
}

/// Selection and Unit Addition

function selectUnitForAdd(unitName) {
	if (!running) {
		alert("Can only place shapes while turn is running!");
		resetRadio();
	}

	else {
		currentUnit = unitName;
		movementMode = false;
		buildingMode = false;
	}
}

function selectBuildingForAdd(unitName) {
	if (!running) {
		alert("Can only place tools while turn is running!");
		resetRadio();
	}
	else {
		currentUnit = unitName;
		movementMode = false;
		buildingMode = true;
	}
}

function switchToMovement() {
	if (!running) {
		alert("Cannot move shapes when turn isn't running!");
		resetRadio();
	}
	else {
		currentUnit = "";
		movementMode = true;
		buildingMode = false;
	}
}

function addUnit(row, col) {
	if (done)
		alert("Game is finished.");
	else if(!running) { //if the turn timer isn't running...
		if (unitGrid[row][col] != "") //and the tile is occupied, delete it
			unitGrid[row][col] = "";
		else if (unitGrid[row][col] == "" && buildingGrid[row][col] != "")
			buildingGrid[row][col] = "";

	} 
	else { //if the turn timer is running...

		if (movementMode)
			moveUnit(row, col);

		else if (currentUnit == "") //show error if no unit has been selected yet
			alert("No shape or tool selected!");

		else if (buildingMode) {
			placeBuilding(row, col);
		}

		else if (currentUnit != "") { //if there is a unit selected and the tile is empty...
			placeShape(row, col);
		}
	}
}

function moveUnit(row, col) {
	if (unitGrid[row][col] != "" && currentUnit == "") { //and they do not have unit selected and the tile they selected is occupied...
				var legal = true;
				for (i = 0; i < unitsPlacedThisTurn.length; i++) {
					if (unitsPlacedThisTurn[i][0] == row && unitsPlacedThisTurn[i][1] == col) { //if the unit on the tile wasn't placed this turn...
						alert("Shapes cannot be moved the same turn they were placed or was already moved!");
						legal = false;
					}
				}
				if (legal) {
					currentUnit = unitGrid[row][col]; //select that unit for movement
					move_row = row;
					move_col = col;
				}
			}

	else if ((unitGrid[row][col] == "" && currentUnit != "") || (unitGrid[row][col] != "" && (currentUnit == "circle" || currentUnit == "twocircles"))) { //and a unit is already selected and the tile they selected isn't occupied...
		var legalMoves = findLegalMoves(move_row, move_col);
		var found = false;
		for (i = 0; i < legalMoves.length; i++) {
			if (legalMoves[i][0] == row && legalMoves[i][1] == col) { //if the selected tile is a legal move for the unit...
				if (currentUnit == "circle") {
					if (unitGrid[row][col] == "circle")
						unitGrid[row][col] = "twocircles";
					else if (unitGrid[row][col] == "twocircles")
						unitGrid[row][col] = "threecircles";
					else if (unitGrid[row][col] != "") {
						alert("Cannot move one shape on top of another!");
						return;
					}
					else
						unitGrid[row][col] = currentUnit;
				}
				else if (currentUnit == "twocircles" && unitGrid[row][col] == "circle")
					unitGrid[row][col] = "threecircles";
				else if (unitGrid[row][col] != "" && currentUnit != "circle") {
					alert("Cannot move one shape on top of another!");
					return;
				}
				else
					unitGrid[row][col] = currentUnit;
				unitGrid[move_row][move_col] = ""; //move the unit
				currentUnit = "";
				found = true;
				var alreadyInArray = false;
				for (i = 0; i < unitsPlacedThisTurn.length; i++) {
					if (unitsPlacedThisTurn[i][0] == row && unitsPlacedThisTurn[i][1] == col) {
						alreadyInArray = true;
						break;
					}
				}
				if (!alreadyInArray)
					unitsPlacedThisTurn.push(makeTuple(row, col));
				if (found)
					break;
			}
		}
		if (!found)
			alert("Cannot move there!");

	}
	else if (unitGrid[row][col] != "" && currentUnit != "") {//show error if unit is selected but the new tile is already occupied
		if (row == move_row && col == move_col)
			currentUnit = "";
		else
			alert("Cannot move one shape on top of another!");
	}
	else if (unitGrid[row][col] == "" && currentUnit == "" && buildingGrid[row][col] != "")
		alert("Tools cannot be moved!");
}

function placeBuilding(row, col) {
	if (buildingGrid[row][col] == "" && currentUnit != "") {
		if (money - costs[currentUnit] < 0) //show error if the user doesn't have enough money
			alert ("Not enough ink to buy this tool!");
		else { //otherwise, place the unit
			buildingGrid[row][col] = currentUnit;
			money -= costs[currentUnit];
			if (currentUnit == "compass")
				moneyPerTurn += 1;
			if (currentUnit == "inksplot") {
				var squares = getSquare(row, col);
				for (i = 0; i < squares.length; i++) {
					if (buildingGrid[squares[i][0]][squares[i][1]] == "")
						buildingGrid[squares[i][0]][squares[i][1]] = currentUnit;
				}
			}
		}
	}
}

function placeShape(row, col) {
	if (money - costs[currentUnit] < 0) //show error if the user doesn't have enough money
		alert ("Not enough ink to buy this shape!");
	else { //otherwise, place the unit
		if (currentUnit == "circle" && unitGrid[row][col] != "") {
			if (unitGrid[row][col] == "circle")
				unitGrid[row][col] = "twocircles";
			else if (unitGrid[row][col] == "twocircles")
				unitGrid[row][col] = "threecircles";
			else if (unitGrid[row][col] == "threecircles") {
				alert("Can only stack 3 Circles at once!");
				return;
			}
		}
		else if (currentUnit != "circle" && unitGrid[row][col] != "")
			alert("Cannot place a shape or building on top of another!");
		else
			unitGrid[row][col] = currentUnit;
		money -= costs[currentUnit];
		unitsPlacedThisTurn.push(makeTuple(row, col));
	}
}

// Movement Helper functions

function findLegalMoves(row, col) {
	var moves =[];
	if (currentUnit == "star") {
		for (i = 0; i < 8; i++) {
			if (i != row)
				moves.push(makeTuple(i, col));
			if (i != col)
				moves.push(makeTuple(row, i));
		}
	}
	else {
		if (row != 0)
			moves.push(makeTuple(row-1, col));
		if (col != 0)
			moves.push(makeTuple(row, col-1));
		if (row != 7)
			moves.push(makeTuple(row+1, col));
		if (col != 7)
			moves.push(makeTuple(row, col+1));
		if (currentUnit == "hexagon") {
			if (row != 0) {
				if (col != 0)
					moves.push(makeTuple(row-1, col-1));
				if (col != 7)
					moves.push(makeTuple(row-1, col+1));
			}
			if (row != 7) {
				if (col != 0)
					moves.push(makeTuple(row+1, col-1));
				if (col != 7)
					moves.push(makeTuple(row+1, col+1));
			}
		}
	}
	return moves;
}

function getSquare(row, col) {
	var moves = [];
	if (row != 7) {
		moves.push(makeTuple(row+1, col));
		if (col != 7)
			moves.push(makeTuple(row+1, col+1));
	}
	if (col != 7)
		moves.push(makeTuple(row, col+1));
	return moves;
}

/// Reset Functions

function reset() {
	var result = confirm("Are you sure you want to reset the game?");
	if (result) {
		f_resetTime = true;
		f_resetMoney = true;
		if (!running)
			resetTime();
		f_earlyEnd = false;

		turnCounter = 0;
		money = 0;
		moneyPerTurn = 1;
		score = 0;
		running = false;
		done = false;
		unitGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];
		buildingGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];
		move_row = 0;
		move_col = 0;
		scoreHistory = "";

		document.getElementById("turnCounter").innerHTML = "TURN:";
		document.getElementById("scoreCount").innerHTML = "SCORE:";
		document.getElementById("moneyCount").innerHTML = "CURRENT INK:";
		document.getElementById("score_history").innerHTML = "";
	}
}

function resetRadio() {
	radioUnits = document.getElementsByName("unit");
	for (i = 0; i < radioUnits.length; i++)
		radioUnits[i].checked = false;
}

function resetTime() {
	document.getElementById("timerText").style.color = "black";
	if (f_resetTime) {
		document.getElementById("timerText").innerHTML = "Start the Game?";
		f_resetTime = false;
	}
	else if (turnCounter == 20) {
		document.getElementById("timerText").innerHTML = "GAME FINISHED!";
		done = true;
	}
	else
		document.getElementById("timerText").innerHTML = "TURN FINISHED";
	document.getElementById("start").value = ">>>";
	running = false;
	movementMode = false;
	buildingMode = false;
	unitsPlacedThisTurn = [];
	currentUnit = "";
	f_earlyEnd = false;
	resetRadio();
}
