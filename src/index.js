var $mineSweeper = $('#myMineSweeper');
var mines = 0;
var height = 0;
var width = 0;
var array = [];
var flagCounter = 0;
var timer = 1;
var startTimer;
var topTenScore = [];
var database = firebase.database();


function AddHighScore(number, name) {
    var hsKey = database.ref().child('highscore').push().key;
    var highScore = {score: number, username: name};
    var updates = {};
    updates['/highscore/' + width + height + '/' + hsKey] = highScore;
    return database.ref().update(updates)
}

function UpdateCounterText(){
    var nextCounter = array
    .reduce((p, c) => p - c.filter(o => o.flag).length, mines);
    $('#counterText').text(nextCounter)
    flagCounter = nextCounter;
    
};

function StartGame() {
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
    for (var i = 0; i < mines; i++) {
        AddRandomMine();
    }

    function AddRandomMine() {
        var loop = true;
        while (loop) {
            var column = Math.floor(Math.random() * width)
            var row = Math.floor(Math.random() * height)

            if (!array[row][column].mine) {
                array[row][column].mine = true;
                loop = false;
            }
        }
    };

    AddNumbers();
    function AddNumbers() {
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i].length; j++) {
                if (!array[i][j].mine) {
                    var surroundingCells = GetSurroundingMines(array, i, j);
                    array[i][j].number = surroundingCells.length;
                }
            }
        }
    };

    function GetSurroundingMines(array, i, j) {
        var simonCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];

        var validCells = simonCells.filter(function (cell) {
            var i = cell[0]
            var j = cell[1]
            return i >= 0 && i < array.length && j >= 0 && j < array[0].length
        })
        var realCells = validCells.map(function (cell) {
            var i = cell[0]
            var j = cell[1]
            return array[i][j]
        })
        var numberOfMines = realCells.filter(function (array) {
            return array.mine;
        })
        return numberOfMines;
    };
    //Reset counter and button picture
    Reset();
    render();
    function render() {
        $mineSweeper.empty();
        for (var i = 0; i < array.length; i++) {
            var $myRow = $('<div/>', { class: 'row' })
            $mineSweeper.append($myRow)
            for (var j = 0; j < array[i].length; j++) {
                var selectedCell = array[i][j]
                var text = selectedCell.mine ? ' ' : selectedCell.number > 0 ? selectedCell.number : ' ';
                $myRow.append($('<button/>', {
                    type: 'button', 'data-i': i, 'data-j': j,
                    text: selectedCell.open ? text : ' ',
                    class: selectedCell.open && selectedCell.mine ? 'openmineCell' : selectedCell.open ? 'opencell' : selectedCell.flag ? 'flagCell' : selectedCell.ask ? 'askCell' : 'cell'
                }))
            }
        }
    };

    function OpenSurroundingCells(i, j) {
        var surroundingCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];
        var validCells = surroundingCells.filter((cell) => {
            var i = cell[0]
            var j = cell[1]
            return i >= 0 && i < array.length && j >= 0 && j < array[0].length
        });
        var cellsForRecursion = validCells.filter((cell) => {
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

    function OpenSurroundingNonFlaggedCells(i, j) {
        var surroundingCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];
        var validCells = surroundingCells.filter((cell) => {
            let k = cell[0]
            let l = cell[1]
            return k >= 0 && k < array.length && l >= 0 && l < array[0].length
        });
        var flagCells = validCells.filter((cell) => {
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

    $(document).on('dblclick', '.opencell', function (e) {
        e.stopImmediatePropagation();
        var $cell = $(this);
        var i = $cell.data('i');
        var j = $cell.data('j');
        OpenSurroundingNonFlaggedCells(i, j);
    });

    $(document).on('contextmenu', '.flagCell, .cell, .askCell', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var $cell = $(this);
        const setCellClass = (n) => $cell.attr('class', n);

        var i = $cell.data('i');
        var j = $cell.data('j');
        
        switch($cell.attr('class')){
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
        UpdateCounterText();          
    })

    $(document).on('click', '.cell', function (event) {
        event.stopImmediatePropagation();
        var $cell = $(this)
        var i = $cell.data('i');
        var j = $cell.data('j');

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
       
        UpdateCounterText();
        render();
    })

    function ClickedOnZero(i, j) {
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
                }
            }
        }
    }

    function UserWon(i, j) {
        var closedCells = array
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
}

function SetUpGame(){
    height = $('#height').val();
    height = parseInt(height);
    width = $('#width').val();
    width = parseInt(width);
    
    if(height >= 2 && width >= 2 && height <= 50 && width <= 50){
        mines = Math.round((width * height) / 8) + 1;
        $('#size').toggle();
        $('#game').toggle();
        StartGame();
    }
    else{
        $('#chooseSize').html('<p style="color: red;">Must be between 2 and 50<p/>');
        return;
    }
}

function AskForHighScoreSubmit() {
    if(topTenScore.length >= 10){
        if(topTenScore[9].score > timer){
                if(confirm('Top ten! Submit highscore?')){
                    var name = prompt('Choose name (max 10 characters)')
                    while(true){
                        if(name.length <= 10){
                            AddHighScore(timer, name);
                            break;
                    }
                        else{
                            name = prompt('Max 10 characters');
                    }
                }
            }
        }
        else{
            alert('Too bad for highscore');
        }
    }
    else{
        if(confirm('Top ten! Submit highscore?')){
            var name = prompt('Choose name (max 10 characters)')
            while(true){
                if(name.length <= 10){
                    AddHighScore(timer, name);
                    break;
                }
                else{
                    name = prompt('Max 10 characters');
                }
            }
        }
    }
}

function Reset() {
    UpdateCounterText()
    $('#playAgain').attr('class', 'playAgain')
    try {clearInterval(startTimer);} catch (error) {}
    timer = 1;
    $('#timer').text(timer);
    $('#hsBody').empty();
    $('#highScoreText').text('Lowscore ' + width + ' x ' + height);

    startTimer = setInterval(() => {timer++; $('#timer').text(timer)}, 1000);

    database.ref('/highscore/' + width + height + '/').once('value').then(function(snapshot) {
        let obj = snapshot.val()
        for(var key in obj){
            topTenScore.push({username: obj[key].username, score: obj[key].score});
        }
        topTenScore = topTenScore.sort((a, b) => a.score - b.score).slice(0, 10);
        topTenScore.forEach(c => {
            $('#hsBody').append($('<tr/>', {html: '<td>' + c.username + '</td><td class="scoreTd">' + c.score + '</td>'}))
        })
    });
}