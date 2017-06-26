/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "41007bfff3c38dcb0798848ffd7be03d.png";

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(2);

var $mineSweeper = $('#myMineSweeper');
var height = 0;
var width = 0;
var mines = 0;
var flagCounter = 0;
var timerAndHighscore = 1;
var startTimer;
var topTenScore = [];
var database = firebase.database();
var mobileFlag = false;
var array = [];

var ResetHighScore = function ResetHighScore() {
    $('#highScoreText').text('Lowscore ' + width + ' x ' + height);
    $('#hsBody').empty();
    topTenScore = [];
    database.ref('/highscore/' + width + height + '/').once('value').then(function (snapshot) {
        var obj = snapshot.val();
        for (var key in obj) {
            topTenScore.push({ username: obj[key].username, score: obj[key].score });
        }
        topTenScore = topTenScore.sort(function (a, b) {
            return a.score - b.score;
        }).slice(0, 10);
        topTenScore.forEach(function (c, i) {
            var newTr = $('<tr/>');
            newTr.append($('<td/>', { text: i + 1 }));
            newTr.append($('<td/>', { text: c.username, class: 'nameTd' }));
            newTr.append($('<td/>', { text: c.score, class: 'scoreTd' }));
            $('#hsBody').append(newTr);
        });
    });
};

var AddHighScore = function AddHighScore(number, name) {
    var hsKey = database.ref().child('highscore').push().key;
    var highScore = { score: number, username: name };
    var updates = {};
    updates['/highscore/' + width + height + '/' + hsKey] = highScore;
    database.ref().update(updates);
    ResetHighScore();
};

var StartGame = function StartGame() {
    var AskForHighScoreSubmit = function AskForHighScoreSubmit() {
        if (topTenScore.length >= 10) {
            if (topTenScore[9].score > timerAndHighscore) {
                if (confirm('Top ten! Submit highscore?')) {
                    var name = prompt('Choose name (max 10 characters)');
                    while (true) {
                        if (name.length <= 10) {
                            AddHighScore(timerAndHighscore, name);
                            break;
                        } else {
                            name = prompt('Max 10 characters');
                        }
                    }
                }
            } else {
                alert('Yay!! no highscore though!');
            }
        } else {
            if (confirm('Top ten! Submit highscore?')) {
                var name = prompt('Choose name (max 10 characters)');
                while (true) {
                    if (name.length <= 10) {
                        AddHighScore(timerAndHighscore, name);
                        break;
                    } else {
                        name = prompt('Max 10 characters');
                    }
                }
            }
        }
    };

    var UpdateCounterText = function UpdateCounterText() {
        flagCounter = array.reduce(function (p, c) {
            return p - c.filter(function (o) {
                return o.flag;
            }).length;
        }, mines);
        $('#counterText').text(flagCounter);
    };

    var SwitchToFlag = function SwitchToFlag() {
        mobileFlag = !mobileFlag;
        $('#flagButton').toggleClass('flagButton active');
    };

    var UserWon = function UserWon(i, j) {
        var closedCells = array.reduce(function (p, c) {
            return c.filter(function (o) {
                return !o.open;
            }).length + p;
        }, 0);

        if (closedCells == mines && array[i][j].mine == false) {
            array[i][j].open = true;
            $('.playAgain').attr('class', 'userWon');
            array.forEach(function (r) {
                return r.forEach(function (cell) {
                    return cell.open = true;
                });
            });
            render();
            AskForHighScoreSubmit();
            return true;
        } else return false;
    };

    var AddRandomMine = function AddRandomMine() {
        var loop = true;
        while (loop) {
            var column = Math.floor(Math.random() * width);
            var row = Math.floor(Math.random() * height);

            if (!array[row][column].mine) {
                array[row][column].mine = true;
                loop = false;
            }
        }
    };

    var FilterCells = function FilterCells(i, j) {
        var surroundingCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];
        var validCells = surroundingCells.filter(function (cell) {
            var i = cell[0];
            var j = cell[1];
            return i >= 0 && i < array.length && j >= 0 && j < array[0].length;
        });
        return validCells;
    };

    var GetSurroundingMines = function GetSurroundingMines(i, j) {
        var validCells = FilterCells(i, j);
        var realCells = validCells.map(function (cell) {
            var i = cell[0];
            var j = cell[1];
            return array[i][j];
        });
        var numberOfMines = realCells.filter(function (array) {
            return array.mine;
        });
        return numberOfMines;
    };

    var AddNumbers = function AddNumbers() {
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i].length; j++) {
                if (!array[i][j].mine) {
                    var surroundingMineCells = GetSurroundingMines(i, j);
                    array[i][j].number = surroundingMineCells.length;
                };
            };
        };
    };

    var render = function render() {
        $mineSweeper.empty();
        for (var i = 0; i < array.length; i++) {
            var $myRow = $('<div/>', { class: 'row' });
            $mineSweeper.append($myRow);
            for (var j = 0; j < array[i].length; j++) {
                var selectedCell = array[i][j];
                var text = selectedCell.number > 0 ? selectedCell.number : ' ';
                $myRow.append($('<button/>', {
                    type: 'button', 'data-i': i, 'data-j': j,
                    text: selectedCell.open ? text : ' ',
                    class: selectedCell.open && selectedCell.mine && selectedCell.flag ? 'openmineCellFlagged' : selectedCell.open && selectedCell.mine ? 'openmineCell' : selectedCell.open ? 'opencell' : selectedCell.flag ? 'flagCell' : selectedCell.ask ? 'askCell' : 'cell'
                }));
            };
        };
    };

    var OpenSurroundingCells = function OpenSurroundingCells(i, j) {
        var validCells = FilterCells(i, j);
        var cellsForRecursion = validCells.filter(function (cell) {
            i = cell[0];
            j = cell[1];
            return array[i][j].open == false && array[i][j].number == 0;
        });
        validCells.forEach(function (cell) {
            i = cell[0];
            j = cell[1];
            array[i][j].open = true;
            array[i][j].flag = false;
            array[i][j].ask = false;
        });
        return cellsForRecursion;
    };

    var ClickedOnZero = function ClickedOnZero(i, j) {
        array[i][j].open = true;
        var allCellsToCheck = OpenSurroundingCells(i, j);
        var loopingLength = allCellsToCheck;
        for (var k = 0; k < loopingLength.length; k++) {
            i = allCellsToCheck[k][0];
            j = allCellsToCheck[k][1];
            var returnedCells = OpenSurroundingCells(i, j);
            if (returnedCells.length > 0) {
                for (var l = 0; l < returnedCells.length; l++) {
                    loopingLength.push(returnedCells[l]);
                };
            };
        };
    };

    var OpenSurroundingNonFlaggedCells = function OpenSurroundingNonFlaggedCells(i, j) {
        var validCells = FilterCells(i, j);
        var flagCells = validCells.filter(function (cell) {
            var k = cell[0];
            var l = cell[1];
            return array[k][l].flag;
        });
        if (flagCells.length == array[i][j].number) {
            validCells.forEach(function (cell) {
                var k = cell[0];
                var l = cell[1];
                if (!array[k][l].flag) {
                    if (array[k][l].mine) {
                        array.forEach(function (r) {
                            return r.forEach(function (cell) {
                                return cell.open = true;
                            });
                        });
                        $('.playAgain').attr('class', 'userLost');
                        clearInterval(startTimer);
                    };
                    if (array[k][l].number == 0 && !array[k][l].mine) {
                        ClickedOnZero(k, l);
                    };
                    array[k][l].open = true;
                    array[k][l].flag = false;
                    array[k][l].ask = false;
                }
            });
        }
        if (UserWon(i, j)) clearInterval(startTimer);

        render();
    };

    var TriggerClick = function TriggerClick(event) {
        event.stopImmediatePropagation();
        var $cell = event.currentTarget;
        var i = $cell.getAttribute('data-i');
        var j = $cell.getAttribute('data-j');
        i = parseInt(i);
        j = parseInt(j);

        if (array[i][j].number != 0) {
            array[i][j].open = true;
        } else if (array[i][j].number == 0 && !array[i][j].mine) {
            ClickedOnZero(i, j);
        } else if (array[i][j].mine) {
            array.forEach(function (r) {
                return r.forEach(function (cell) {
                    return cell.open = true;
                });
            });
            $('.playAgain').attr('class', 'userLost');
            clearInterval(startTimer);
        };

        if (UserWon(i, j)) {
            clearInterval(startTimer);
        }

        UpdateCounterText(mines);
        render();
    };

    var TriggerDoubleClick = function TriggerDoubleClick(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var i = e.currentTarget.getAttribute('data-i');
        var j = e.currentTarget.getAttribute('data-j');
        i = parseInt(i);
        j = parseInt(j);
        OpenSurroundingNonFlaggedCells(i, j);
    };

    var TriggerRightClick = function TriggerRightClick(event) {
        var cell = event.currentTarget;
        event.preventDefault();
        event.stopImmediatePropagation();
        var setCellClass = function setCellClass(n) {
            return cell.setAttribute('class', n);
        };

        var i = cell.getAttribute('data-i');
        var j = cell.getAttribute('data-j');

        switch (cell.getAttribute('class')) {
            case 'cell':
                if (flagCounter >= 1) {
                    array[i][j].flag = true;
                    setCellClass('flagCell');
                    break;
                } else {
                    return;
                }
            case 'flagCell':
                array[i][j].flag = false;
                array[i][j].ask = true;
                setCellClass('askCell');
                break;
            case 'askCell':
                array[i][j].ask = false;
                setCellClass('cell');
                break;
            default:
                break;
        };
        UpdateCounterText(mines);
    };

    if (width === 9 && height === 9) {
        mines = 10;
    } else if (width === 16 && height === 16) {
        mines = 40;
    } else if (width === 30 && height === 16) {
        mines = 99;
    }

    if (width > 10) {
        $('#minesweep').attr('class', 'mineSweeperLarge mineSweeper');
    } else {
        $('#minesweep').attr('class', 'mineSweeper');
    }

    var Reset = function Reset() {
        UpdateCounterText();

        $('#playAgain').attr('class', 'playAgain');

        try {
            clearInterval(startTimer);
        } catch (error) {}

        mobileFlag = false;
        $('#flagButton').attr('class', 'flagButton');

        timerAndHighscore = 1;
        $('#timer').text(timerAndHighscore);
        startTimer = setInterval(function () {
            timerAndHighscore++;$('#timer').text(timerAndHighscore);
        }, 1000);

        array = [];

        for (var i = 0; i < height; i++) {
            array[i] = [];
            for (var j = 0; j < width; j++) {
                array[i][j] = {
                    number: 0,
                    open: false,
                    mine: false,
                    flag: false,
                    ask: false
                };
            }
        }

        for (var _i = 0; _i < mines; _i++) {
            AddRandomMine();
        }

        AddNumbers();
        Object.freeze(array);
        render();
    };

    $(document).on('dblclick', '.opencell', function (e) {
        return TriggerDoubleClick(e);
    });
    $(document).on('doubletap', '.opencell', function (e) {
        return TriggerDoubleClick(e);
    });
    $(document).on('contextmenu', '.flagCell, .cell, .askCell', function (e) {
        return TriggerRightClick(e);
    });
    $(document).on('contextmenu', '.opencell', function (e) {
        return false;
    });
    $(document).on('click', '.cell', function (event) {
        if (mobileFlag) {
            TriggerRightClick(event);
            return;
        }
        TriggerClick(event);
    });
    $(document).on('click', '.askCell, .flagCell', function (event) {
        if (mobileFlag) {
            TriggerRightClick(event);
        }
    });
    Reset();
    $('#playAgain').click(function () {
        return Reset();
    });
    $('#flagButton').click(function () {
        return SwitchToFlag();
    });
};

var SetSize = function SetSize(w, h) {
    width = parseInt(w);
    height = parseInt(h);
    mines = Math.round(width * height / 8) + 1;
    StartGame();
    ResetHighScore();
    $('#size').toggle();
    $('#game').toggle();
};

var SetCustomSize = function SetCustomSize(w, h) {
    height = $('#height').val();
    height = parseInt(height);
    width = $('#width').val();
    width = parseInt(width);
    $('#width').val('');
    $('#height').val('');

    if (height <= 50 && width <= 50) {
        mines = Math.round(width * height / 8) + 1;
        $('#size').toggle();
        $('#game').toggle();
        ResetHighScore();
        StartGame();
    } else {
        $('#chooseSize').html('<p style="color: red;">Too many ingredients<p/>');
        return;
    }
};

var SwitchSize = function SwitchSize() {
    $('#chooseSize').html('<p>Tacos</p>');
    $('#game').toggle();
    $('#size').toggle();
};

$('#setSize99').click(function () {
    return SetSize(9, 9);
});
$('#setSize1616').click(function () {
    return SetSize(16, 16);
});
$('#setSize3016').click(function () {
    return SetSize(30, 16);
});
$('#startGameButton').click(function () {
    return SetCustomSize();
});
$('#switchSize').click(function () {
    return SwitchSize();
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(3);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(11)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(undefined);
// imports


// module
exports.push([module.i, "* {\n    padding: 0;\n    margin: 0;\n}\nhtml, body {\n    min-height: 100%;\n}\n\n.wrapper {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n}\n#size p {\n    text-align: center;\n    font-size: 20px;\n    margin-bottom: 10px;\n}\n.sizeFix {\n    font-size: 20px;\n    display: flex;\n    justify-content: center;\n    margin: auto;\n    font-family: sans-serif;\n    color: #333;\n}\n\ninput {\n    width: 40%;\n    height: 32px;\n    font-size: 15px;\n    line-height: 21px;\n    padding: 6px;\n    text-align: center;\n    width: 89px;\n    border: 1px solid rgb(221, 221, 221);\n    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);\n    margin: 8px 0px;\n    border-radius: 5px;\n}\n\ninput:invalid {\n    border: 2px solid rgba(255,20,0,255);\n    padding: 5px;\n}\n\n.defaultButton {\n    background-color: #f6f6f6;\n    border: 2px;\n    border-color: rgb(221, 221, 221);\n    color: #333;\n    box-shadow: 0 2px 3px rgba(0,0,0,.15);\n    box-sizing: border-box;\n    margin: 8px 0px;\n    text-shadow: 0 1px 0 #f3f3f3;\n    border-radius: .3125em;\n    font-weight: bold;\n    font-size: 16px;\n    position: relative;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    cursor: pointer;\n    padding: 11.2px 16px;\n    width: 300px;\n    -webkit-tap-highlight-color: rgba(0,0,0,0);\n}\n\n.defaultButton:hover{\n    background-color: #ededed;\n}\n\n#switchSize {\n    display: flex;\n    margin: auto;\n    justify-content: center;\n    margin-bottom: 8px;\n}\n\n.wrapper {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n}\n@media screen and (min-width: 681px){\n    .size {\n        display: flex;\n        flex-direction: column;\n        justify-content: center;\n        width: 300px;\n        margin: auto;\n    }\n        .size div {\n            width: 100%;\n            margin: auto;\n        }\n\n        .size p {\n            text-align: center;\n            font-size: 20px;\n            margin-top: 10px;\n            font-weight: bold;\n        }\n    .customSize {\n        display: flex;\n        justify-content: center;\n        width: 80%;  \n    }\n        .customSize button {\n            width: 100px;\n            border-radius: 5px;\n            margin-left: 5px;\n        }\n}\n\nh1 {\n    text-align: center;\n    font-size: 50px;\n    border-bottom: 1px solid black;\n    margin-bottom: 10px;\n    padding-bottom: 5px;\n}\n\n.mineSweeper {\n    display: flex;\n    justify-content: center;\n}\n\n.infoBox {\n    display: flex;\n    justify-content: center;\n    width: 50%;\n    margin: auto;\n    height: 60px;\n    margin-bottom: 5px;\n}\n\n    .infoBox p, .timer {\n        width: 80px;\n        font-size: 43px;\n        align-self: center;\n    }\n\n    .infoBox .timer {\n        text-align: right;\n    }\n\n    .infoBox button {\n        width: 60px;\n        height: 60px;\n        align-self: center;\n    }\n\n.highscoreTable {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    width: 260px;\n    margin: auto;\n    margin-top: 10px;\n    border: 2px solid #333;\n    padding: 2px;\n    background-color: #f6f6f6;\n    border-radius: 5px;\n}\n    .highscoreTable table {\n        align-self: center;\n        width: 100%;\n    }\n    .highscoreTable td, th {\n        font-size: 20px;\n    }\n    .highscoreTable .nameTd {\n        padding-left: 10px;\n    }\n    \n    .highscoreTable .scoreTd {\n        text-align: center;\n        padding: 0px 20px;\n    }\n    .highscoreTable p {\n        font-size: 30px;\n        text-align: center;\n        margin-bottom: 5px;\n        color: #333;\n    }\n    .nameTh {\n        text-align: left;\n        padding-left: 10px;\n        \n    }\n\n.playAgain {\n    background-image: url(" + __webpack_require__(5) + ");\n    background-size: cover;\n}\n\n.userLost {\n    background-image: url(" + __webpack_require__(6) + ");\n    background-size: cover;\n}\n\n.userWon {\n    background-image: url(" + __webpack_require__(7) + ");\n    background-size: cover;\n}\n\n.askCell, .flagCell, .cell, .opencell, .openmineCell, .openmineCellFlagged {\n    width: 30px;\n    height: 30px;\n}\n\n.askCell {\n    background-image: url(" + __webpack_require__(8) + ");\n    background-color: #f6f6f6;\n    border: groove;\n    border-color: black;\n    background-size: cover;\n}\n\n.flagCell {\n    background-image: url(" + __webpack_require__(0) + ");\n    background-color: #f6f6f6;\n    border: groove;\n    border-color: black;\n    background-size: cover;\n}\n\n.cell {\n    border: groove;\n    border-color: black;\n    background-color: #f6f6f6;\n}\n\n.cell:hover {\n    box-shadow: 0 0 0 1px  inset;\n}\n\n.row {\n    display: flex;\n}\n\n.opencell {\n    background-color: black;\n    color: white;\n    font-weight: bolder;\n    font-size: 20px;\n    border: 2px solid white;\n}\n\n.openmineCell {\n    border: groove;\n    background-image: url(" + __webpack_require__(9) + ");\n    background-size: cover;\n}\n\n.openmineCellFlagged {\n    border: groove;\n    background-image: url(" + __webpack_require__(10) + ");\n    background-size: cover;\n}\n\n.flagButton {\n        display: none;\n}\n\n@media(max-width: 680px){\n    .flagButton {\n        display: block;\n        width: 40px;\n        height: 40px;\n        margin-right: 10px;\n        background-image: url(" + __webpack_require__(0) + ");\n        background-size: cover;\n        background-color: #f6f6f6;\n        border-radius: 5px;\n        border: 2px unset;\n    }\n    .mineSweeperLarge {\n        display: flex;\n        justify-content: flex-start;\n        overflow: scroll;\n    }\n    .size p {\n        text-align: center;\n        font-size: 20px;\n        margin-top: 10px;\n        font-weight: bold;\n    }\n\n    .active {\n        display: block;\n        width: 40px;\n        height: 40px;\n        margin-right: 10px;\n        background-image: url(" + __webpack_require__(0) + ");\n        background-size: cover;\n        background-color: #f6f6f6;\n        border-radius: 5px;\n        border: 5px inset;\n        \n    }\n    .infoBox {\n    display: flex;\n    justify-content: space-around;\n    width: 100%;\n    margin: auto;\n    height: 60px;\n    margin-bottom: 5px;\n}\n    .defaultButton {\n        width: 100%;\n    }\n    .infoBox p, .timer {\n        width: 55px;\n        font-size: 45px;\n        align-self: center;\n    }\n\n    .infoBox .timer {\n        text-align: right;\n    }\n\n    .infoBox button {\n        max-width: 60px;\n        max-height: 60px;\n        align-self: center;\n    }\n    #switchSize {\n        margin: auto;\n        margin-bottom: 10px;\n        width: 100%;\n        text-align: center;\n    }\n    input {\n        width: 48%;\n    }\n    .whContainer{\n        display: flex;\n        width: 100%;\n    }\n    \n}\n\n", ""]);

// exports


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "90de6e1e26177a9e649b58d11ea5d27f.jpg";

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "7d8ea77f42c167f15323f978a6b965e4.jpg";

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e3a4d7e69d2c5fdff0423939c87e1f7c.jpg";

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "460208596b667a99482904082dc8a45d.png";

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4a5099ec5fb14a48a84d4a8f4c1af6dd.jpg";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dd47b9a5d7aea3ab22cdcf2dc557ca00.jpg";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(12);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 12 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);