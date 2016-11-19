// Global vars
let selectedCell = "";
let winChecks = 0;
let numberOfMoves = 0;
let moveTimes = [Date.now()];
let averageTimeArray = [];
let gridLocations = ["00", "03", "06", "30", "33", "36", "60", "63", "66"];
let gameInProgress = false;
let numberOfHints = 0;
let gameClock = null;
let gameTime = {
  seconds: 0,
  minutes: 0,
  hours: 0
}

// Initial board state array
const boardState = [
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""]
];

// Handles formatting of the game timer
const timerLogic = () => {
  if (gameTime.seconds < 59) {
    gameTime.seconds += 1;
  } else if (gameTime.seconds === 59 && gameTime.minutes < 59) {
    gameTime.seconds = 0;
    gameTime.minutes += 1;
  } else if (gameTime.seconds === 59 && gameTime.minutes === 59) {
    gameTime.hours += 1;
  }

  if (gameTime.seconds < 10 && gameTime.minutes < 10) {
    document.getElementById("gameClock").innerHTML = `Game Time: 0${gameTime.minutes}:0${gameTime.seconds}`
  }  else if (gameTime.minutes > 10 && gameTime.seconds < 10) {
    document.getElementById("gameClock").innerHTML = `Game Time: ${gameTime.minutes}:0${gameTime.seconds}`
  } else if (gameTime.seconds < 10) {
    document.getElementById("gameClock").innerHTML = `Game Time: ${gameTime.minutes}:0${gameTime.seconds}`
  } else if (gameTime.minutes < 10) {
    document.getElementById("gameClock").innerHTML = `Game Time: 0${gameTime.minutes}:${gameTime.seconds}`
  }
}

// Returns which grid a given location is a member of
const getMemberGrid = (location) => {
  let row = location.split("")[0];
  let col = location.split("")[1];
  if (row < 3 && col < 3) {
    return "00";
  } else if (row < 3 && col < 6) {
    return "03";
  } else if (row < 3 && col < 9) {
    return "06";
  } else if (row < 6 && col < 3) {
    return "30";
  } else if (row < 6 && col < 6) {
    return "33";
  } else if (row < 6 && col < 9) {
    return "36";
  } else if (row < 9 && col < 3) {
    return "60";
  } else if (row < 9 && col < 6) {
    return "63";
  } else if (row < 9 && col < 9) {
    return "66";
  }
}


// Handles cell click
const cellClicked = (cellId) => {
  if (selectedCell) {
    selectedCell.className = "cell";
  }
  let cell = document.getElementById(cellId);
  selectedCell = cell;
  cell.className += " selected";
}

// Calculates and edits average time for move
const editAverageTime = () => {
  moveTimes.push(Date.now());
  if (moveTimes.length === 2) {
    averageTimeArray.push(Math.floor(moveTimes[1] - moveTimes[0]) / 1000);
  } else if (moveTimes.length > 2) {
    averageTimeArray.push(Math.floor((moveTimes[moveTimes.length - 1] - moveTimes[moveTimes.length - 2])) / 1000);
  }
  const sum = averageTimeArray.reduce((a, b) => a + b);
  const average = sum / numberOfMoves;

  document.getElementById("averageTime").innerHTML = `Average move time: ${average.toFixed(2)} seconds`;  
};

// Calculates and edits number of moves made
const editNumberOfMoves = () => {
  numberOfMoves++;
  document.getElementById("numOfMoves").innerHTML = `Number of moves: ${numberOfMoves}`;
};

// Handles number input
const keyPressed = (e) => {

  // If number
  if (e.keyCode >= 49 && e.keyCode <= 57) {
    if (selectedCell) {
      editNumberOfMoves();
      editAverageTime();
      let cellId = selectedCell.getAttribute('id').split("");
      let cellRow = cellId[0];
      let cellColumn = cellId[1];
      boardState[cellRow][cellColumn] = Number(e.key);
      drawBoard(boardState);
    }
  } 

  if (selectedCell && (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight")) {
    let cellId = selectedCell.getAttribute('id');
    let row = cellId.split("")[0];
    let col = cellId.split("")[1];
    if (e.code === "ArrowUp" && row !== "0") {
      let newCell = `${row - 1}${col}`;
      cellClicked(newCell); 
    }
    if (e.code === "ArrowLeft" && col !== "0") {
      let newCell = `${row}${col - 1}`;
      cellClicked(newCell); 
    }
    if (e.code === "ArrowRight" && col !== "8") {
      let newCell = `${row}${Number(col) + 1}`;
      cellClicked(newCell); 
    }
    if (e.code === "ArrowDown" && col !== "8") {
      let newCell = `${Number(row) + 1}${col}`;
      cellClicked(newCell); 
    }
  }

}

// Returns if move is valid
const isMoveValid = (value, location) => {

  let row = location.split("")[0];
  let col = location.split("")[1];

  // Is space availble
  if (boardState[row][col] !== "") {
    return false;
  }
  // Check if valid in row
  if (boardState[row].indexOf(value) !== -1) {
    return false;
  }
  // Check if valid in column
  for (let r = 0; r < 9; r++) {
    if (boardState[r][col] === value) {
      return false;
    }
  }
  // Check if valid in grid
  let gridId = getMemberGrid(location);
  let gridRow = gridId.split("")[0];
  let gridCol = gridId.split("")[1];
  let gridArray = [];
  for (let r = Number(gridRow); r <= (Number(gridRow) + 2); r++) {
    for (let c = Number(gridCol); c <= (Number(gridCol) + 2); c++) {
      gridArray.push(boardState[r][c]);
    }
  }
  if (gridArray.indexOf(value) !== -1) {
    return false;
  }


  return true;
}


// Generate game
const generateGame = (difficulty) => {

  // Hide new game screen
  document.getElementById("newGameScreen").style.display = 'none';

  // Show game screen
  document.getElementById("gameScreen").style.display = 'block';

  // Start timer
  gameClock = setInterval(timerLogic, 1000);

  for (let i = 0; i < difficulty;) {
    let randomNumber = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
    let randomRow = "";
    let randomCol = "";
    let randomLocation = "";

    // Fill in at least one number in each grid
    if (i < gridLocations.length) {

      let curLocation = gridLocations[i];
      let curRow = curLocation.split("")[0];
      let curCol = curLocation.split("")[1];

      let max = Number(curRow) + 3;
      let min = Number(curRow);
      randomRow = Math.floor(Math.random() * (max - min)) + min;

      max = Number(curCol) + 3;
      min = Number(curCol);
      randomCol = Math.floor(Math.random() * (max - min)) + min;

    } else {

      randomRow = Math.floor(Math.random() * (9 - 0) + 0);
      randomCol = Math.floor(Math.random() * (9 - 0) + 0);

    }

    randomLocation = `${randomRow}${randomCol}`;

    if (isMoveValid(randomNumber, randomLocation) && 81 > i) {
      boardState[randomRow][randomCol] = randomNumber;
      i++;
    }

  }

  drawBoard(boardState);

}


// Draws board
const drawBoard = (boardState) => {
  const boardContainer = document.getElementById("board");
  boardContainer.innerHTML = "";
  boardState.forEach((row, rIndex) => {
    row.forEach((cell, cIndex) => {
      let newCell = document.createElement("div");
      newCell.className = "cell";
      newCell.setAttribute("id", `${rIndex}${cIndex}`);
      newCell.innerText = boardState[rIndex][cIndex];
      boardContainer.appendChild(newCell);
      newCell.addEventListener('mouseup', (e) => {
        cellClicked(`${rIndex}${cIndex}`);
      })
    });
  });
};

// Checks if array of numbers is unique
const arrayUnique = (arr) => {
  let uniqueObj = {};
  let unique = "";
  arr.forEach((item) => {
    if (uniqueObj[item] === "") {
      unique = false;
    } else {
      uniqueObj[item] = "";
    }
  });
  return unique === false ? false : true;
}

// Checks if row is unique
const rowUnique = (row) => {
  return arrayUnique(row);
};

// Checks if column is unique
const colUnique = (colNumber) => {
  let col = [];
  let uniqueObj = {};
  boardState.forEach(row => {
    col.push(row[colNumber]);
  });
  return arrayUnique(col);
};

// Checks if grid is unique
const gridUnique = (startCell) => {
  let gridArray = [];
  let startRow = Number(startCell.split("")[0]);
  let startCol = Number(startCell.split("")[1]);
  for (let col = startCol; col <= startCol + 2; col++) {
    for (let row = startRow; row <= startRow + 2; row++) {
      gridArray.push(boardState[row][col]);
    }
  }
  return arrayUnique(gridArray);
}

// Checks for winning board
const checkWin = () => {

  // Check all rows
  let rowsUnique = null;
  let rows = boardState.map(arrayUnique);
  if (rows.indexOf(false) === -1) {
    rowsUnique = true;
  } else {
    rowsUnique = false;
    return false;
  }

  // Check all cols
  let colsUnique = null;
  let cols = [];
  for (let col = 0; col < 9; col++) {
    cols.push(colUnique(col));
  }
  if (cols.indexOf(false) === -1) {
    colsUnique = true;
  } else {
    colsUnique = false;
    return false;
  }

  // Check all grids
  let gridsUnique = null;
  let gridLocations = ["00", "03", "06", "30", "33", "36", "60", "63", "66"];
  let gridsArray = [];
  gridLocations.forEach(grid => {
    gridsArray.push(gridUnique(grid));
  });
  if (gridsArray.indexOf(false) === -1) {
    gridsUnique = true;
  } else {
    gridsUnique = false;
    return false;
  }
  return true;
}

// Checks if board is a winner
const checkWinsPressed = () => {
  winChecks++;
  document.getElementById("numOfWinChecks").innerHTML = `Number of win checks: ${winChecks}`;
  if(checkWin()) {
    alert("You are a winnner!");
  } else {
    alert("Board is not correct");
  }
}

const hintPressed = () => {
  
  let randomNumber = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
  let randomRow = Math.floor(Math.random() * (9 - 0) + 0);
  let randomCol = Math.floor(Math.random() * (9 - 0) + 0);
  let randomLocation = `${randomRow}${randomCol}`;

  for (let i = 0; i < 1;) {
    if (isMoveValid(randomNumber, randomLocation)) {
      console.log("Move found");
      boardState[randomRow][randomCol] = randomNumber;
      i++;
    }
  }

  drawBoard(boardState);
  numberOfHints = numberOfHints - 1;

  if (numberOfHints === 0) {
    document.getElementById("hintButton").style.disabled = "true";
    alert("No hints remaining");
  }

}

const newGamePressed = () => {

  // Show new game screen
  document.getElementById("newGameScreen").style.display = 'block';
  // Hide game screen
  document.getElementById("gameScreen").style.display = 'none';
  // Stop timer
  clearInterval(gameClock);
  // Reset stats
  winChecks = 0;
  numberOfMoves = 0;
  moveTimes = [Date.now()];
  averageTimeArray = [];
  gameTime = {
    seconds: 0,
    minutes: 0,
    hours: 0
  }

  // Rerender elements
  document.getElementById("numOfMoves").innerHTML = `Number of moves: ${numberOfMoves}`;
  document.getElementById("averageTime").innerHTML = `Average move time: 0 seconds`;  
  document.getElementById("gameClock").innerHTML = `Game Time: 00:00`;
  document.getElementById("numOfWinChecks").innerHTML = `Number of win checks: 0`;

}

// Event Listeners
document.getElementById("checkButton").addEventListener("click", checkWinsPressed);
document.addEventListener("keyup", keyPressed);
document.getElementById("easyGame").addEventListener("click", () => generateGame(20));
document.getElementById("mediumGame").addEventListener("click", () => generateGame(15));
document.getElementById("hardGame").addEventListener("click", () => generateGame(40));
// document.getElementById("hintButton").addEventListener("click", hintPressed);
document.getElementById("newGameButton").addEventListener("click", newGamePressed);

