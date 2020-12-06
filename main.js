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

var resetTime = false;
var resetMoney = false;

function makeTuple(a,b) {
	return [a,b];
}

function resetRadio() {
	radioUnits = document.getElementsByName("unit");
	for (i = 0; i < radioUnits.length; i++)
		radioUnits[i].checked = false;
}

function startTurn() {
	if (turnCounter == 20) {
		document.getElementById("TimerText").innerHTML = "GAME FINISHED";
		done = true;
	}
	if (running == false) {
		var time = timeSet;
		running = true;
		turnCounter += 1;
		document.getElementById("turnCounter").innerHTML = "TURN: " + turnCounter + " / 20";
		document.getElementById("start").value = "End Turn?";
		if (turnCounter == 6 || turnCounter == 11 || turnCounter == 16)
			moneyPerTurn += 1;
		money += moneyPerTurn;
		timer();
		var turnTimer = setInterval(timer, 1000);
		var updateMoney = setInterval(money_u, 100);
	}
	else if (running) {
		var result = confirm("Are you sure you want to end your turn early?");
		if (result) {
			resetTime = true;
			document.getElementById("timerText").innerHTML = "TURN FINISHED";
			document.getElementById("start").value = ">>>";
			running = false;
			movementMode = false;
			buildingMode = false;
			unitsPlacedThisTurn = [];
			currentUnit = ""
			resetRadio();
		}
	}
	function timer() {
		if (resetTime) {
			document.getElementById("timerText").style.color = "black";
			clearInterval(turnTimer);
			resetTime = false;
		}
		else if (time <= 0) {
			clearInterval(turnTimer);
			document.getElementById("timerText").style.color = "black";
			document.getElementById("timerText").innerHTML = "TURN FINISHED";
			document.getElementById("start").value = ">>>";
			running = false;
			movementMode = false;
			buildingMode = false;
			unitsPlacedThisTurn = [];
			currentUnit = "";
			resetRadio();

		} else {
			document.getElementById("timerText").innerHTML = time + " SECONDS";
			if (time <= 10)
				document.getElementById("timerText").style.color = "red";
		}
		time -= 1;
	}

	function money_u() {
		if (resetMoney) {
			clearInterval(updateMoney);
			resetMoney = false;
		}
		else {
			moneyNextTurn = moneyPerTurn;
			if (turnCounter == 5 || turnCounter == 10 || turnCounter == 15)
				moneyNextTurn += 1;
			document.getElementById("moneyCount").innerHTML = "CURRENT INK: " + money + " (+" + moneyNextTurn + ")";
		}
	}
}

function selectUnitForAdd(unitName) {
	if (!running) {
		alert("Can only place units while turn is running!");
		resetRadio();
	}

	else {
		currentUnit = unitName;
		movementMode = false;
		buildingMode = false;
	}
}

function switchToMovement() {
	if (!running) {
		alert("Cannot move units when turn isn't running!");
		resetRadio();
	}
	else {
		currentUnit = "";
		movementMode = true;
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
			alert("No unit selected!");

		else if (buildingMode) {
			if (buildingGrid[row][col] == "" && currentUnit != "") {
				if (money - costs[currentUnit] < 0) //show error if the user doesn't have enough money
					alert ("Not enough money to buy this tool!");
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

		else if (unitGrid[row][col] == "" && currentUnit != "") { //if there is a unit selected and the tile is empty...
			if (money - costs[currentUnit] < 0) //show error if the user doesn't have enough money
				alert ("Not enough money to buy this unit!");
			else { //otherwise, place the unit
				unitGrid[row][col] = currentUnit;
				money -= costs[currentUnit];
				unitsPlacedThisTurn.push(makeTuple(row, col));
			}
		}
		else
			alert("Cannot place a unit on top of another!");
	}

}

function moveUnit(row, col) {
	if (unitGrid[row][col] != "" && currentUnit == "") { //and they do not have unit selected and the tile they selected is occupied...
				var legal = true;
				for (i = 0; i < unitsPlacedThisTurn.length; i++) {
					if (unitsPlacedThisTurn[i][0] == row && unitsPlacedThisTurn[i][1] == col) { //if the unit on the tile wasn't placed this turn...
						alert("Unit's cannot be moved the same turn they were placed or was already moved!");
						legal = false;
					}
				}
				if (legal) {
					currentUnit = unitGrid[row][col]; //select that unit for movement
					move_row = row;
					move_col = col;
				}
			}


			else if (unitGrid[row][col] == "" && currentUnit != "") { //and a unit is already selected and the tile they selected isn't occupied...
				var legalMoves = findLegalMoves(move_row, move_col);
				var found = false;
				for (i = 0; i < legalMoves.length; i++) {
					if (legalMoves[i][0] == row && legalMoves[i][1] == col) { //if the selected tile is a legal move for the unit...
						unitGrid[row][col] = currentUnit;
						unitGrid[move_row][move_col] = ""; //move the unit
						currentUnit = "";
						found = true;
						unitsPlacedThisTurn.push(makeTuple(row, col));
					}
				}
				if (!found)
					alert("Cannot move there!");

			}
			else if (unitGrid[row][col] != "" && currentUnit != "") //show error if unit is selected but the new tile is already occupied
				if (row == move_row && col == move_col)
					currentUnit = "";
				else
					alert("Cannot move a unit on top of another!");
			else if (unitGrid[row][col] == "" && currentUnit == "" && buildingGrid[row][col] != "")
				alert("Tools cannot be moved!");
}

function updateGrid() {
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {

			var location = row.toString();
			location = location.concat(col.toString());
			var tile = document.getElementById(location);
			if (unitGrid[row][col] != "" && tile.childNodes.length == 0) {
				var path = "./img/" + unitGrid[row][col];
				path = path.concat(".png");
				var img = document.createElement("img");
				path.toLowerCase();
				img.src = path;
				tile.appendChild(img);
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


function reset() {
	var result = confirm("Are you sure you want to reset the game?");
	if (result) {
		resetTime = true;
		resetMoney = true;

		turnCounter = 0;
		money = 0;
		moneyPerTurn = 1;
		score = 0;
		running = false;
		done = false;
		unitGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];
		buildingGrid = [["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""]];
		movementMode = false;
		buildingMode = false;
		move_row = 0;
		move_col = 0;
		currentUnit = "";
		unitsPlacedThisTurn = [];
		scoreHistory = "";

		resetRadio();
		document.getElementById("timerText").innerHTML = "Start the Game?";
		document.getElementById("turnCounter").innerHTML = "TURN:";
		document.getElementById("scoreCount").innerHTML = "SCORE:";
		document.getElementById("moneyCount").innerHTML = "CURRENT INK:";
		document.getElementById("score_history").innerHTML = "";
		document.getElementById("start").value = ">>>";
	}
}
