'use strict';

var FLAG = '⛳';
var MINE = '💣';
var SAD = '😩';
var HAPPY = '😀';
var WINNER = '😎';

var gBoard;
var gLevels = [{ SIZE: 4, MINES: 2, LIVES: 1 }, { SIZE: 8, MINES: 12, LIVES: 2 }, { SIZE: 12, MINES: 30, LIVES: 3 }, ];;
var gLevel = gLevels[0];

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};


function chooseLevel(elRadioBtn) {
    cellClicked.didrun = false;
    gLevel = gLevels[+elRadioBtn.dataset.idx];
    initGame();
}

function initGame() {
    reset();
    gLevels = [{ SIZE: 4, MINES: 2, LIVES: 0 }, { SIZE: 8, MINES: 12, LIVES: 2 }, { SIZE: 12, MINES: 30, LIVES: 3 }, ];
    gBoard = buildBoard(gLevel);
    renderBoard(gBoard);
    document.getElementById('flags').innerText = gLevel.MINES;
    document.getElementById('lives').innerText = gLevel.LIVES;

}

function buildBoard(level) {
    // var SIZE = 4;
    var SIZE = level.SIZE;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    // board[1][1].isMine = true;
    // board[0][1].isMine = true;

    return board;
}


function addMines(board, level) {
    var minesNum = level.MINES;
    for (var i = 0; i < minesNum; i++) {
        var emptyCells = getEmptyCells(board);
        var randomCell = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)];
        board[randomCell.i][randomCell.j].isMine = true;
    }
}

function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length - 1; i++) {
        for (var j = 0; j < board[i].length - 1; j++) {
            var pos = { i, j };
            if (!board[i][j].isMine && !board[i][j].isShown) {
                emptyCells.push(pos);
            }
        }
    }
    return emptyCells;
}

function countMinesNegs(cellI, cellJ, board) {
    var minesNegsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) minesNegsCount++;
        }
    }
    return minesNegsCount;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = countMinesNegs(i, j, board);
        }
    }
}


function showNegs(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            cell.isShown = true;
            gGame.shownCount++;
            var elCell = document.getElementById(`cell-${i}-${j}`);
            elCell.classList.add('selected');
            if (!cell.minesAroundCount) elCell.innerText = '';
            else elCell.innerText = cell.minesAroundCount;
        }
    }
    gGame.shownCount--;
}

function cellClicked(ev, elCell, i, j) {
    // console.log(ev.button)

    elCell.addEventListener('contextmenu', function(click) {
        click.preventDefault();
    })
    var cell = gBoard[i][j];
    if (cell.isMarked) return;
    if (ev.button === 2) return cellMarked(elCell, i, j);
    cell.isShown = true;
    gGame.shownCount++;
    if (cell.isMine) {
        elCell.classList.add('selected-mine');
        elCell.innerText = MINE;
        gLevel.LIVES--;
        document.getElementById('lives').innerText = gLevel.LIVES;
        if (!gLevel.LIVES) return gameOver('loose');
    } else {
        if (!cell.minesAroundCount) showNegs(i, j, gBoard);
        else {
            elCell.innerText = cell.minesAroundCount;
            elCell.classList.add('selected');
        }
    }
    if (!cellClicked.didrun) {
        start();
        addMines(gBoard, gLevel)
        setMinesNegsCount(gBoard);
        cellClicked.didrun = true;
        console.log(gBoard)
    }
    checkGameOver(gBoard);
}

function cellMarked(elCell, i, j) {
    if (gGame.markedCount === gLevel.MINES) return;
    var cell = gBoard[i][j];
    cell.isMarked = true;
    gGame.markedCount++;
    document.getElementById('flags').innerText = gLevel.MINES - gGame.markedCount;
    elCell.classList.add('marked');
    elCell.innerText = FLAG;
    checkGameOver(gBoard);
}

function checkGameOver() {
    return gGame.shownCount + gGame.markedCount === gBoard.length ** 2 ? gameOver('win') : false;
}

function gameOver(state) {
    pause();
    switch (state) {
        case 'win':
            console.log('win');
            break;
        case 'loose':
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[0].length; j++) {
                    var cell = gBoard[i][j];
                    if (cell.isMine) {
                        cell.isShown = true;
                        var elCell = document.querySelector(`#cell-${i}-${j}`);
                        elCell.innerText = MINE;
                    }
                }
            }
            break;
    }
}



function expandShown(board, elCell, i, j) {

}