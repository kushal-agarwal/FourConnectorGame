 
var firstGame = true;
$(document).ready(function() {
    $("body").on("click","#b_again",function() {
        $("#b_again,#winner").hide();
        $("#info").show();
    });
    $("body").on("click","#b_start",function() {
        $("#info").hide();
        if (firstGame) {
            startGame();
        } else {
            Game.restartGame();
        }
    });
});
function Game() {
    this.rows = 6;
    this.columns = 7;
    this.status = 0;
    this.depth = 4;
    this.score = 100000,
    this.round = 0;
    this.winning_array = [];
    this.iterations = 0;
    that = this;
    that.init();
}
Game.prototype.init = function() {
    var game_board = new Array(that.rows);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.columns);
        for (j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }
    this.board = new Board(this, game_board, 0);
    game_board = "";
    for (i = 0; i < that.rows; i++) {
        game_board += "<tr>";
        for (j = 0; j < that.columns; j++) {
            game_board += "<td class='empty'></td>";
        }
        game_board += "</tr>";
    }
    document.getElementById('game_board').innerHTML = game_board;
    var td = document.getElementById('game_board').getElementsByTagName("td");
    for (i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act);
        }
    }
};
Game.prototype.act = function(e) {
    var element = e.target || window.event.srcElement;
    if (that.round===0) that.place(element.cellIndex);
    if (that.round==1) that.generateComputerDecision();
};
Game.prototype.place = function(column) {
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        for (var y = that.rows - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.round == 1) {
                    document.getElementById('game_board').rows[y].cells[column].className = 'checker cpu-checker';
                    //document.getElementById('game_board').rows[y].cells[column].innerHTML = "<div class='cpu-checkers'></div>";
                } else {
                    document.getElementById('game_board').rows[y].cells[column].className = 'checker human-checker';
                    //document.getElementById('game_board').rows[y].cells[column].innerHTML = "<div class='human-checkers'></div>";
                }
                break;
            }
        }
        if (!that.board.place(column)) {
            return alert("Invalid move!");
        }
        that.round = that.switchRound(that.round);
        that.updateStatus();
    }
};
Game.prototype.generateComputerDecision = function() {
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        that.iterations = 0;
        $("#loading").show();
        setTimeout(function() {
            var ai_move = that.maximizePlay(that.board, that.depth);
            that.place(ai_move[0]);
        },250);
    }
};
Game.prototype.maximizePlay = function(board, depth) {
    // Call score of our board
    var score = board.score();
    // Break
    if (board.isFinished(depth, score)) return [null, score];
    // Column, Score
    var max = [null, -99999];
    // For all possible moves
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy(); // Create new board
        if (new_board.place(column)) {
            that.iterations++; // Debug
            var next_move = that.minimizePlay(new_board, depth - 1); // Recursive calling
            // Evaluate new move
            if (max[0]===null || next_move[1] > max[1]) {
                max[0] = column;
                max[1] = next_move[1];
            }
        }
    }
    $("#loading").hide();
    return max;
};
Game.prototype.minimizePlay = function(board, depth) {
    var score = board.score();
    if (board.isFinished(depth, score)) return [null, score];
    // Column, score
    var min = [null, 99999];
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy();
        if (new_board.place(column)) {
            that.iterations++;
            var next_move = that.maximizePlay(new_board, depth - 1);
            if (min[0]===null || next_move[1] < min[1]) {
                min[0] = column;
                min[1] = next_move[1];
            }
        }
    }
    return min;
};
Game.prototype.switchRound = function(round) {
    // 0 Human, 1 Computer
    if (round == 0) {
        return 1;
    } else {
        return 0;
    }
}
Game.prototype.updateStatus = function() {
    if (that.board.score() == -that.score) {
        that.status = 1;
        that.markWin();
        $("#winner").html("YOU HAVE WON!").show();
        $("#b_again").show();
    }
    if (that.board.score() == that.score) {
        that.status = 2;
        that.markWin();
        $("#winner").html("YOU HAVE LOST!").show();
        $("#b_again").show();
    }
    if (that.board.isFull()) {
        that.status = 3;
        $("#winner").html("IT'S A TIE!").show();
        $("#b_again").show();
    }
}
Game.prototype.markWin = function() {
    document.getElementById('game_board').className = "finished";
    for (var i = 0; i < that.winning_array.length; i++) {
        var name = document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className;
        document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className = name + " win";
    }
}
Game.prototype.restartGame = function() {
    var difficulty = document.getElementById('difficulty');
    var depth = difficulty.options[difficulty.selectedIndex].value;
    that.depth = depth;
    that.status = 0;
    that.round = 0;
    that.init();
}
function startGame() {
    firstGame = false;
    window.Game = new Game();
}
// ********
function Board(game, field, player) {
    this.game = game
    this.field = field;
    this.player = player;
}
Board.prototype.isFinished = function(depth, score) {
    if (depth == 0 || score == this.game.score || score == -this.game.score || this.isFull()) {
        return true;
    }
    return false;
}
Board.prototype.place = function(column) {
    if (this.field[0][column] == null && column >= 0 && column < this.game.columns) {
        for (var y = this.game.rows - 1; y >= 0; y--) {
            if (this.field[y][column] == null) {
                this.field[y][column] = this.player;
                break;
            }
        }
        this.player = this.game.switchRound(this.player);
        return true;
    } else {
        return false;
    }
}
Board.prototype.scorePosition = function(row, column, delta_y, delta_x) {
    var human_points = 0;
    var computer_points = 0;
    this.game.winning_array_human = [];
    this.game.winning_array_cpu = [];
    for (var i = 0; i < 4; i++) {
        if (this.field[row][column] == 0) {
            this.game.winning_array_human.push([row, column]);
            human_points++;
        } else if (this.field[row][column] == 1) {
            this.game.winning_array_cpu.push([row, column]);
            computer_points++;
        }
        row += delta_y;
        column += delta_x;
    }
    if (human_points == 4) {
        this.game.winning_array = this.game.winning_array_human;
        return -this.game.score;
    } else if (computer_points == 4) {
        this.game.winning_array = this.game.winning_array_cpu;
        return this.game.score;
    } else {
        return computer_points;
    }
}
Board.prototype.score = function() {
    var points = 0;
    var vertical_points = 0;
    var horizontal_points = 0;
    var diagonal_points1 = 0;
    var diagonal_points2 = 0;
    for (var row = 0; row < this.game.rows - 3; row++) {
        for (var column = 0; column < this.game.columns; column++) {
            var score = this.scorePosition(row, column, 1, 0);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            vertical_points += score;
        }            
    }
    for (var row = 0; row < this.game.rows; row++) {
        for (var column = 0; column < this.game.columns - 3; column++) { 
            var score = this.scorePosition(row, column, 0, 1);   
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            horizontal_points += score;
        } 
    }
    for (var row = 0; row < this.game.rows - 3; row++) {
        for (var column = 0; column < this.game.columns - 3; column++) {
            var score = this.scorePosition(row, column, 1, 1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            diagonal_points1 += score;
        }            
    }
    for (var row = 3; row < this.game.rows; row++) {
        for (var column = 0; column <= this.game.columns - 4; column++) {
            var score = this.scorePosition(row, column, -1, +1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            diagonal_points2 += score;
        }

    }
    points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
    return points;
}
Board.prototype.isFull = function() {
    for (var i = 0; i < this.game.columns; i++) {
        if (this.field[0][i] == null) {
            return false;
        }
    }
    return true;
}
Board.prototype.copy = function() {
    var new_board = new Array();
    for (var i = 0; i < this.field.length; i++) {
        new_board.push(this.field[i].slice());
    }
    return new Board(this.game, new_board, this.player);
}

