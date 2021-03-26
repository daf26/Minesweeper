'use strict';

var gStartTime;
var gElapsedTime = 0;
var gTimerInterval;

function renderBoard(board) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isShown) {
                if (cell.isMine) cell = MINE;
                else {
                    if (!cell.minesAroundCount) cell = '';
                    else cell = cell.minesAroundCount;
                }
            } else cell = '';
            cell = '';
            var className = `cell`;
            // var className = `cell cell${i}-${j}`;
            var cellId = `cell-${i}-${j}`;

            strHTML += `<td class="${className}" id="${cellId}" onmousedown="cellClicked(event, this, ${i}, ${j})">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


// Create function to modify innerHTML

function print(txt) {
    document.getElementById("time").innerHTML = txt;
}

// Create "start", "pause" and "reset" functions
// https://tinloof.com/blog/how-to-build-a-stopwatch-with-html-css-js-react-part-2/

function start() {
    gStartTime = Date.now() - gElapsedTime;
    gTimerInterval = setInterval(function printTime() {
        gElapsedTime = Date.now() - gStartTime;
        print(timeToString(gElapsedTime));
        gGame.secsPassed = Math.floor(gElapsedTime / 1000);
    }, 1000);
}

function pause() {
    clearInterval(gTimerInterval);
}

function reset() {
    clearInterval(gTimerInterval);
    print('000');
    gElapsedTime = 0;
}

function timeToString(time) {
    let diffInSec = time / 1000;
    let sec = Math.floor(diffInSec);
    let formattedSec = sec.toString().padStart(3, "0");
    return formattedSec;
}

function renderHints() {
    var strHTML = '<h1>';
    for (var i = 0; i < gHintsCount; i++) {
        strHTML += `<span id="hint${i+1}" onclick="toggleHint(this)">${HINT}</span>`;
    }
    strHTML += '</h1>';
    document.querySelector('.hints').innerHTML = strHTML;
}


function toggleHint(elHint) {
    if (gGame.isHintOn) {
        gGame.isHintOn = false;
        elHint.innerHTML = HINT;
    } else {
        gGame.isHintOn = true;
        elHint.innerHTML = HINT_REVEAL;
    }
}