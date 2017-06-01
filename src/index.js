var $mineSweeper = $('#myMineSweeper');
var mines = 0;
var height = 0;
var width = 0;
var array = [];
var flagCounter = 0;

function UpdateCounterText(){
    var nextCounter = array.reduce((p, c) => {
        let counter = 0;
        c.forEach(o => o.flag ? counter++ : o);
        return p - counter;
    }, mines);
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

    GetSurroundingMines(array, 0, 0);
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
    UpdateCounterText()
    $('#playAgain').attr('class', 'playAgain')

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

    function OpenSurroundingCells(array, i, j) {
        var simonCells = [[i + 1, j], [i + 1, j + 1], [i + 1, j - 1], [i - 1, j], [i - 1, j - 1], [i - 1, j + 1], [i, j + 1], [i, j - 1]];
        var validCells = simonCells.filter(function (cell) {
            var i = cell[0]
            var j = cell[1]
            return i >= 0 && i < array.length && j >= 0 && j < array[0].length
        });
        var cellsForRecursion = validCells.filter(function (cell) {
            i = cell[0]
            j = cell[1]
            return array[i][j].open == false && array[i][j].number == 0;
        });
        validCells.forEach(function (cell) {
            i = cell[0]
            j = cell[1]
            array[i][j].open = true;
            array[i][j].flag = false;
            array[i][j].ask = false;
        });
        return cellsForRecursion;
    };

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
        };
        UpdateCounterText();          
    })

    $(document).on('click', '.cell', function (event) {
        event.stopImmediatePropagation();
        var $cell = $(this)
        var i = $cell.data('i');
        var j = $cell.data('j');


        var closedCells = array.reduce((p, c) => {
            let numberOfClosedCells = 0;
            c.forEach(o => o.open ? o : numberOfClosedCells++);
            return p + numberOfClosedCells;
        }, 0);
      
        if (closedCells == mines + 1 && array[i][j].mine == false) {
            array[i][j].open = true;
            render();
            $('.playAgain').toggleClass('userWon')
            array.forEach(r => r.forEach(cell => cell.open = true));
        }

        else if (array[i][j].number != 0) {
            array[i][j].open = true;
        }

        else if (array[i][j].number == 0 && !array[i][j].mine) {
            array[i][j].open = true;
            var allCellsToCheck = OpenSurroundingCells(array, i, j);
            var loopingLength = allCellsToCheck;
            for (var k = 0; k < loopingLength.length; k++) {
                i = allCellsToCheck[k][0];
                j = allCellsToCheck[k][1];
                var returnedCells = OpenSurroundingCells(array, i, j);
                if (returnedCells.length > 0) {
                    for (var l = 0; l < returnedCells.length; l++) {
                        loopingLength.push(returnedCells[l]);
                    }
                }
            }
        }

        else if (array[i][j].mine) {
            array.forEach(r => r.forEach(cell => cell.open = true));
            $('.playAgain').toggleClass('userLost')
        };
        UpdateCounterText();
        render();
    })
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
