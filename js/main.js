'use strict';

var FLAG = '⛳';
var MINE = '💣';
var LOOSE = '😩';
var NORMAL = '😀';
var WIN = '😎';
var HINT = '📘';
var HINT_REVEAL = '📖';

var gBoard;
var gLevels = [
    { SIZE: 4, MINES: 2, LIVES: 1 },
    { SIZE: 8, MINES: 12, LIVES: 2 },
    { SIZE: 12, MINES: 30, LIVES: 3 }
];
var gLevel = gLevels[0];
var gLivesCount;
var gHintsCount;
var gSafeClicksCount;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHintOn: false,
    isSafeOn: false,
    isManual: false,
    manualMinesCount: 0
};


function chooseLevel(elRadioBtn) {
    gLevel = gLevels[+elRadioBtn.dataset.idx];
    initGame(gLevel);
}

function initGame(level) {
    reset();
    cellClicked.didrun = false;
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.isManual = false;
    gGame.manualMinesCount = 0;
    gHintsCount = 3;
    gSafeClicksCount = 3;
    gLivesCount = gLevel.LIVES;
    gLevels = [{ SIZE: 4, MINES: 2, LIVES: 1 }, { SIZE: 8, MINES: 12, LIVES: 2 }, { SIZE: 12, MINES: 30, LIVES: 3 }];
    gBoard = buildBoard(level);
    renderBoard(gBoard);
    document.getElementById('flags').innerText = gLevel.MINES;
    document.getElementById('lives').innerText = gLivesCount;
    document.querySelector('.smiley').innerHTML = NORMAL;
    document.querySelector('#safe-clicks').innerText = gSafeClicksCount;
    document.getElementById('best-time').innerText = (!localStorage.getItem('bestTime' + gLevel.SIZE)) ? '' : localStorage.getItem('bestTime' + gLevel.SIZE) + ' sec';
    renderHints();

    document.getElementById('mines').innerText = gLevel.MINES - gGame.manualMinesCount;
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
            if (board[i][j].isMine) continue;
            if (board[i][j].isShown) continue;
            emptyCells.push(pos);
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
            if (i === cellI && j === cellJ) continue;
            var cell = board[i][j];
            if (cell.isMarked || cell.isShown) continue;
            cell.isShown = true;
            gGame.shownCount++;
            var elCell = document.getElementById(`cell-${i}-${j}`);
            elCell.classList.add('selected');
            if (cell.minesAroundCount) {
                elCell.innerText = cell.minesAroundCount;
            } else {
                elCell.innerText = '';
                showNegs(i, j, gBoard);
            }
        }
    }
}

function cellClicked(ev, elCell, i, j) {
    // console.log(ev.button)
    elCell.addEventListener('contextmenu', function(click) {
        click.preventDefault();
    })
    if (!gGame.isOn) return;
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (ev.button === 2) return cellMarked(elCell, i, j);

    if (gGame.isManual) {
        if (cell.isMine) {
            cell.isMine = false;
            elCell.innerText = '';
            gGame.manualMinesCount--;
            document.getElementById('mines').innerText = gLevel.MINES - gGame.manualMinesCount;
        } else {
            if (gLevel.MINES === gGame.manualMinesCount) return;
            cell.isMine = true;
            elCell.innerText = MINE;
            gGame.manualMinesCount++;
            document.getElementById('mines').innerText = gLevel.MINES - gGame.manualMinesCount;
        }
        if (gLevel.MINES === gGame.manualMinesCount) {
            document.getElementById('manually-play').hidden = false;
        } else {
            document.getElementById('manually-play').hidden = true;
        }
    } else {

        if (!cellClicked.didrun) {
            start();
            if (!gGame.manualMinesCount) {
                addMines(gBoard, gLevel);
            }
            setMinesNegsCount(gBoard);
            cellClicked.didrun = true;
            gGame.isSafeOn = true;
            console.log(gBoard)
        }

        if (gGame.isHintOn) {
            if (cell.isShown || cell.isMarked) return;
            revealHint(i, j, gBoard);
            setTimeout(hideHint, 1000, i, j, gBoard);
            gHintsCount--;
            renderHints();

        } else {
            cell.isShown = true;
            gGame.shownCount++;
            if (!cell.isMine) {
                elCell.classList.add('selected');
                if (!cell.minesAroundCount) {
                    elCell.innerText = '';
                    showNegs(i, j, gBoard);
                } else {
                    elCell.innerText = cell.minesAroundCount;
                }
            } else {
                elCell.classList.add('selected-mine');
                elCell.innerText = MINE;
                if (!gGame.isHintOn) {
                    gLivesCount--;
                    document.getElementById('lives').innerText = gLivesCount;
                    if (!gLivesCount) return gameOver('loose');
                }
            }
            checkGameOver(gBoard);
        }
    }
}

function cellMarked(elCell, i, j) {
    if (gGame.isManual) return;
    var cell = gBoard[i][j];
    if (cell.isMarked) {
        cell.isMarked = false;
        gGame.markedCount--;
        document.getElementById('flags').innerText = gLevel.MINES - gGame.markedCount;
        elCell.classList.remove('marked');
        elCell.innerText = '';
    } else {
        if (gGame.markedCount === gLevel.MINES) return;
        cell.isMarked = true;
        gGame.markedCount++;
        document.getElementById('flags').innerText = gLevel.MINES - gGame.markedCount;
        elCell.classList.add('marked');
        elCell.innerText = FLAG;
        checkGameOver(gBoard);
    }
}

function checkGameOver() {
    return gGame.shownCount + gGame.markedCount === gBoard.length ** 2 ? gameOver('win') : false;
}

function gameOver(state) {
    pause();
    gGame.isOn = false;
    gGame.isSafeOn = false;
    cellClicked.didrun = false;
    switch (state) {
        case 'win':
            console.log('win');
            document.querySelector('.smiley').innerHTML = WIN;
            if (gGame.secsPassed < parseInt(localStorage.getItem('bestTime' + gLevel.SIZE)) ||
                localStorage.getItem('bestTime' + gLevel.SIZE) === null) {
                localStorage.setItem('bestTime' + gLevel.SIZE, gGame.secsPassed);
                document.getElementById('best-time').innerText = localStorage.getItem('bestTime' + gLevel.SIZE) + ' sec';
            }
            break;
        case 'loose':
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[0].length; j++) {
                    var cell = gBoard[i][j];
                    var elCell = document.querySelector(`#cell-${i}-${j}`);
                    if (cell.isMarked && cell.isMine) elCell.classList.add('selected-mine');
                    if (cell.isMine && !cell.isMarked) {
                        cell.isShown = true;
                        elCell.innerText = MINE;
                    }
                }
                document.querySelector('.smiley').innerHTML = LOOSE;
            }
            break;
    }

}

function revealHint(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.isShown || cell.isMarked) continue;
            var elCell = document.getElementById(`cell-${i}-${j}`);
            elCell.classList.add('selected');
            if (cell.minesAroundCount) elCell.innerText = cell.minesAroundCount;
            else elCell.innerText = '';
            if (cell.isMine) elCell.innerText = MINE;
        }
    }
}


function hideHint(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.isShown || cell.isMarked) continue;
            var elCell = document.getElementById(`cell-${i}-${j}`);
            elCell.classList.remove('selected');
            elCell.innerText = '';
            gGame.isHintOn = false;
        }
    }
}


function safeClick() {
    if (!gGame.isSafeOn) return;
    if (!gSafeClicksCount) return;
    if (gGame.isManual) return;
    var emptyCells = getEmptyCells(gBoard);
    var randomCell = emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)];
    var i = randomCell.i;
    var j = randomCell.j;
    var elCell = document.getElementById(`cell-${i}-${j}`);
    elCell.classList.add('safe');
    setTimeout(function() {
        elCell.classList.remove('safe');
    }, 1500);
    gSafeClicksCount--;
    document.querySelector('#safe-clicks').innerText = gSafeClicksCount;
}

function manuallyCreate() {
    if (cellClicked.didrun) return;
    initGame(gLevel);
    gGame.isManual = true;
    document.querySelector('h4').hidden = false;

}

function playManual() {
    gGame.isManual = false;
    gGame.isSafeOn = true;
    document.querySelector('h4').hidden = true;
    document.getElementById('manually-play').hidden = true;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            // var cell = gBoard[i][j];
            var elCell = document.querySelector(`#cell-${i}-${j}`);
            elCell.innerText = '';
        }
    }
}