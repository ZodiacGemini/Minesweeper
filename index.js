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

const ResetHighScore = () => {
    $('#highScoreText').text('Lowscore ' + width + ' x ' + height);    
    $('#hsBody').empty();    
    topTenScore = []
    database.ref('/highscore/' + width + height + '/').once('value').then(function(snapshot) {
        let obj = snapshot.val()
        for(var key in obj){
            topTenScore.push({username: obj[key].username, score: obj[key].score});
        }
        topTenScore = topTenScore.sort((a, b) => a.score - b.score).slice(0, 10);
        topTenScore.forEach((c, i) => {
            var newTr = $('<tr/>');
            newTr.append($('<td/>', {text: i + 1}));
            newTr.append($('<td/>', {text: c.username, class: 'nameTd'}));
            newTr.append($('<td/>', {text: c.score, class: 'scoreTd'}));
            $('#hsBody').append(newTr);
        })
    });
}

const AddHighScore = (number, name) => {
    let hsKey = database.ref().child('highscore').push().key;
    let highScore = {score: number, username: name};
    let updates = {};
    updates['/highscore/' + width + height + '/' + hsKey] = highScore;
    database.ref().update(updates)
    ResetHighScore();
}


const StartGame = () => {
    const AskForHighScoreSubmit = () => {
        if(topTenScore.length >= 10){
            if(topTenScore[9].score > timerAndHighscore){
                    if(confirm('Top ten! Submit highscore?')){
                        var name = prompt('Choose name (max 10 characters)')
                        while(true){
                            if(name.length <= 10){
                                AddHighScore(timerAndHighscore, name);
                                break;
                        }
                            else{
                                name = prompt('Max 10 characters');
                        }
                    }
                }
            }
            else{
                alert('Yay!! no highscore though!');
            }
        }
        else{
            if(confirm('Top ten! Submit highscore?')){
                var name = prompt('Choose name (max 10 characters)')
                while(true){
                    if(name.length <= 10){
                        AddHighScore(timerAndHighscore, name);
                        break;
                    }
                    else{
                        name = prompt('Max 10 characters');
                    }
                }
            }
        }
    }

    const UpdateCounterText = () => {
        flagCounter = array
        .reduce((p, c) => p - c.filter(o => o.flag).length, mines);
        $('#counterText').text(flagCounter);
    };

    const SwitchToFlag = () => {
        mobileFlag = !mobileFlag;
        $('#flagButton').toggleClass('flagButton active');
    }

    const UserWon = (i, j) => {
        let closedCells = array
        .reduce((p, c) => c.filter(o => !o.open).length + p, 0);
        
        if (closedCells == mines && array[i][j].mine == false) {
            array[i][j].open = true;
            $('.playAgain').attr('class', 'userWon')
            array.forEach(r => r.forEach(cell => cell.open = true));
            render();
            AskForHighScoreSubmit();
            return true;
        }
        else
            return false;
    }

    const AddRandomMine = () => {
        let loop = true;
        while (loop) {
            let column = Math.floor(Math.random() * width)
            let row = Math.floor(Math.random() * height)

            if (!array[row][column].mine) {
                array[row][column].mine = true;
                loop = false;
            }
        }
    };

    const FilterCells = (i, j) => {
        let surroundingCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];
        let validCells = surroundingCells.filter((cell) => {
            let i = cell[0]
            let j = cell[1]
            return i >= 0 && i < array.length && j >= 0 && j < array[0].length
        });
        return validCells;
    };

    const GetSurroundingMines = (i, j) => {
        let validCells = FilterCells(i, j);
        let realCells = validCells.map(function (cell) {
            let i = cell[0]
            let j = cell[1]
            return array[i][j]
        });
        let numberOfMines = realCells.filter(function (array) {
            return array.mine;
        });
        return numberOfMines;
    };

    const AddNumbers = () => {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                if (!array[i][j].mine) {
                    let surroundingMineCells = GetSurroundingMines(i, j);
                    array[i][j].number = surroundingMineCells.length;
                };
            };
        };
    };

    const render = () => {
        $mineSweeper.empty();
        for (let i = 0; i < array.length; i++) {
            let $myRow = $('<div/>', { class: 'row' });
            $mineSweeper.append($myRow);
            for (let j = 0; j < array[i].length; j++) {
                let selectedCell = array[i][j];
                let text = selectedCell.number > 0 ? selectedCell.number : ' ';
                $myRow.append($('<button/>', {
                    type: 'button', 'data-i': i, 'data-j': j,
                    text: selectedCell.open ? text : ' ',
                    class: selectedCell.open && selectedCell.mine && selectedCell.flag ? 'openmineCellFlagged'
                    : selectedCell.open && selectedCell.mine ? 'openmineCell' 
                    : selectedCell.open ? 'opencell' 
                    : selectedCell.flag ? 'flagCell' 
                    : selectedCell.ask ? 'askCell' 
                    : 'cell'
                }));
            };
        };
    };

    const OpenSurroundingCells = (i, j) => {
        let validCells = FilterCells(i, j);
        let cellsForRecursion = validCells.filter((cell) => {
            i = cell[0]
            j = cell[1]
            return array[i][j].open == false && array[i][j].number == 0;
        });
        validCells.forEach((cell) => {
            i = cell[0]
            j = cell[1]
            array[i][j].open = true;
            array[i][j].flag = false;
            array[i][j].ask = false;
        });
        return cellsForRecursion;
    };

    const ClickedOnZero = (i, j) => {
        array[i][j].open = true;
            let allCellsToCheck = OpenSurroundingCells(i, j);
            let loopingLength = allCellsToCheck;
            for (let k = 0; k < loopingLength.length; k++) {
                i = allCellsToCheck[k][0];
                j = allCellsToCheck[k][1];
                let returnedCells = OpenSurroundingCells(i, j);
                if (returnedCells.length > 0) {
                    for (let l = 0; l < returnedCells.length; l++) {
                        loopingLength.push(returnedCells[l]);
                };
            };
        };
    };

    const OpenSurroundingNonFlaggedCells = (i, j) => {
        let validCells = FilterCells(i, j);
        let flagCells = validCells.filter((cell) => {
            let k = cell[0]
            let l = cell[1]
            return array[k][l].flag
        });
        if(flagCells.length == array[i][j].number){
            validCells.forEach((cell) => {
                let k = cell[0];
                let l = cell[1];
                if(!array[k][l].flag){
                    if (array[k][l].mine) {
                        array.forEach(r => r.forEach(cell => cell.open = true));
                        $('.playAgain').attr('class', 'userLost')
                        clearInterval(startTimer);
                    };
                    if (array[k][l].number == 0 && !array[k][l].mine) {
                        ClickedOnZero(k, l);
                    };
                    array[k][l].open = true;
                    array[k][l].flag = false;
                    array[k][l].ask = false;
                }
            })
        }
        if(UserWon(i, j))
            clearInterval(startTimer);
        
        render();
    };

    const TriggerClick = (event) => {
        event.stopImmediatePropagation();
        let $cell = event.currentTarget
        let i = $cell.getAttribute('data-i');
        let j = $cell.getAttribute('data-j');
        i = parseInt(i);
        j = parseInt(j);

        if (array[i][j].number != 0) {
            array[i][j].open = true;
        }

        else if (array[i][j].number == 0 && !array[i][j].mine) {
            ClickedOnZero(i, j);
        }

        else if (array[i][j].mine) {
            array.forEach(r => r.forEach(cell => cell.open = true));
            $('.playAgain').attr('class', 'userLost')
            clearInterval(startTimer);
        };

        if(UserWon(i, j)){
            clearInterval(startTimer);
        }
       
        UpdateCounterText(mines);
        render();
    }

    const TriggerDoubleClick = e => {
        e.stopImmediatePropagation();
        e.preventDefault();
        let i = e.currentTarget.getAttribute('data-i');
        let j = e.currentTarget.getAttribute('data-j');
        i = parseInt(i);
        j = parseInt(j);
        OpenSurroundingNonFlaggedCells(i, j);
    }

    const TriggerRightClick = event => {
        let cell = event.currentTarget;
        event.preventDefault();
        event.stopImmediatePropagation();
        const setCellClass = (n) => cell.setAttribute('class', n);

        let i = cell.getAttribute('data-i');
        let j = cell.getAttribute('data-j');
        
        switch(cell.getAttribute('class')){
            case 'cell':
                if(flagCounter >= 1){
                    array[i][j].flag = true;             
                    setCellClass('flagCell');
                    break;
                }
                else{
                    return;
                }
            case 'flagCell':
                array[i][j].flag = false;                        
                array[i][j].ask = true;             
                setCellClass('askCell')
                break;
            case 'askCell':
                array[i][j].ask = false;                             
                setCellClass('cell')
                break;
            default:
                break;
        };
        UpdateCounterText(mines);
    }

    if(width === 9 && height === 9){
        mines = 10;
    }

    else if(width === 16 && height === 16){
        mines = 40;
    }

    else if(width === 30 && height === 16){
        mines = 99;
    }

    if(width > 10){
        $('#minesweep').attr('class', 'mineSweeperLarge mineSweeper');
    }

    else {
        $('#minesweep').attr('class', 'mineSweeper')
    }

    const Reset = () => {
        UpdateCounterText();
        
        $('#playAgain').attr('class', 'playAgain');
        
        try {clearInterval(startTimer);} catch (error) {}
        
        mobileFlag = false;
        $('#flagButton').attr('class', 'flagButton');
        
        timerAndHighscore = 1;
        $('#timer').text(timerAndHighscore);
        startTimer = setInterval(() => {
            timerAndHighscore++; $('#timer').text(timerAndHighscore)
        }, 1000);

        array = [];

        for (let i = 0; i < height; i++) {
            array[i] = [];
            for (let j = 0; j < width; j++) {
                array[i][j] = {
                    number: 0,
                    open: false,
                    mine: false,
                    flag: false,
                    ask: false
                };
            }
        }

        for (let i = 0; i < mines; i++) {
            AddRandomMine();
        }

        AddNumbers();
        
        render();
    }

    
    $(document).on('dblclick', '.opencell', (e) => TriggerDoubleClick(e));
    $(document).on('doubletap', '.opencell', (e) => TriggerDoubleClick(e));
    $(document).on('contextmenu', '.flagCell, .cell, .askCell', (e) => TriggerRightClick(e));
    $(document).on('contextmenu', '.opencell', (e) =>  false);
    $(document).on('click', '.cell', event => {
        if(mobileFlag) {
            TriggerRightClick(event);
            return;
        }
        TriggerClick(event);
    });
    $(document).on('click', '.askCell, .flagCell', event => {
        if(mobileFlag){
            TriggerRightClick(event)
        }
    });
    Reset();
    $('#playAgain').click(() => Reset());
    $('#flagButton').click(() => SwitchToFlag());
    
}


const SetSize = (w, h) => {
    width = parseInt(w);
    height = parseInt(h);
    mines = Math.round((width * height) / 8) + 1;
    StartGame();
    ResetHighScore()
    $('#size').toggle();
    $('#game').toggle();
}

const SetCustomSize = (w, h) => {
    height = $('#height').val();
    height = parseInt(height);
    width = $('#width').val();
    width = parseInt(width);
    $('#width').val('');
    $('#height').val('');
    
    if(height <= 50 && width <= 50){
        mines = Math.round((width * height) / 8) + 1;
        $('#size').toggle();
        $('#game').toggle();
        ResetHighScore()
        StartGame();
    }
    else{
        $('#chooseSize').html('<p style="color: red;">Too many ingredients<p/>');
        return;
    }
}

const SwitchSize = () => {
    $('#chooseSize').html('<p>Tacos</p>');
    $('#game').toggle();
    $('#size').toggle();
}

$('#setSize99').click(() => SetSize(9, 9));
$('#setSize1616').click(() => SetSize(16, 16));
$('#setSize3016').click(() => SetSize(30, 16));
$('#startGameButton').click(() => SetCustomSize());
$('#switchSize').click(() => SwitchSize());



