class GameDisplay {

    constructor(game) {
        this.ctx = null;
        this.game = game;
        // this.running = true;
        // match values, need to match at least 3?
        // yellow gives $5, purple is $10, pink is $25, red is $100, green is $500 
        // in matrix: yellow is 1, purple 2, pink 3, red, 4, green 5
        this.colors = ["white","Pink", "Blue", "Red", "Green","Purple"];
        this.MAXCOLORS = 5;
        this.MAXROW = 9; // points to the lowest row
        this.state = null;
        this.currentScore = null;

        // time logic fields
        this.elapsedTime = 0;
        this.gameSpeedUp = 1;
        this.numUpdates = 0;

        // player logic fields
        // this will be in block segments
        // all blocks in this game work with 60 frames
        this.canvasSize = document.getElementById('gameWorld');
        this.maxWidth = this.canvasSize.getAttribute('width');
        this.maxHeight = this.canvasSize.getAttribute('height');
        this.playerX = 0;

        // piece logic fields
        this.stateChanged = false;
        this.holdingPiece = 0;


    }

    init(ctx) { 
        this.ctx = ctx;
        this.state = Array(10).fill(Array(10).fill(0)) // creates a new 10 by 10 matrix w/ entries as undefined
        this.currentScore = 0;
    }

    isGameOver() {
        for (let i = 0; i < this.state.length; i++) {
            if (this.state[this.MAXROW][i] !== 0) 
            return true;
        }
        return false; 
    }

    update() {
        if (!this.isGameOver()) {
            this.updateMatrix();
            let newRow = this.makeRow();
            for (let i = 0; i < newRow.length; i++) {
                this.state[0][i] = newRow[i];
            }
            this.draw();
        } else {
            alert("Game Over");
        // do something to say game is over.
        }
    }

    // pushes each row in matrix one level down
    updateMatrix() {
        let updatedMatrix = Array(10).fill(Array(10));
        for (let i = 0; i < this.state.length - 1; i++) {
            updatedMatrix[i + 1] = this.state[i].slice(); 
        }
        this.state = updatedMatrix;
        this.lowestRow++;
    }

    // randomIntFromInterval(min, max) {
    //     return Math.floor(Math.round() * (max - min + 1) + min);
    // }

    // creates our new array that will be placed at the top of our matrix
    // returns the new row so that we can add to matrix in update()
    makeRow() {
        let newRow = Array(10);
        let lastEntry = 0;
        let upperEntry = 0;
        for (let i = 0; i < newRow.length; i++) {
            // this is safe to do because we are working with an array of zeros
            upperEntry = this.state[1][i];

            // curr will be 1, ..., n, where n is length of all possible options
            let curr = Math.floor(Math.random() * this.MAXCOLORS) + 1
            // dont want matching numbers next to each other
            // check that new number is also not the same as the one below it
            if (lastEntry === curr || upperEntry === curr) {
                i--;
                continue;
            }
            lastEntry = curr;
            newRow[i] = curr;
        }
        return newRow;
    }

    drawRows() {
        let radius = 30;
        let startX = radius;
        let startY = radius;
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state.length; j++) {
                this.ctx.fillStyle = this.colors[this.state[i][j]];
                this.ctx.beginPath();
                this.ctx.arc(startX + j * radius, startY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                startX += radius;
            }
            startY += radius * 2;
            startX = radius; 
        }
    }

    matchingAlgorithm(row, column) {
        // get current color
        let curr = this.state[row][column];
        let matchesOnRight = 0;
        let matchesOnLeft = 0;
        let matchesAbove = 0;
        let matchesBelow = 0;
        let hasMatch = false;
        // check for number of matches on right
        for (let i = column + 1; i <= this.MAXROW; i++) {
            if (this.state[row][i] !== curr) {
                break;
            }
            matchesOnRight++;
        }

        // check for number of matches on left
        for (let j = column - 1; j >= 0; j--) {
            if (this.state[row][j] !== curr) {
                break;
            }
            matchesOnLeft++;
        }

        // check for number of matches above
        for (let k = row + 1; k <= this.MAXROW; k++) {
            if (this.state[k][column] !== curr) {
                break;
            }
            matchesAbove++;
        }

        // check for number of matches below
        for (let r = row - 1; r >= 0; r--) {
            if (this.state[r][column] !== curr) {
                break;
            }
            matchesBelow++;
        }

        // make update
        // we have 3 or more match, delete elements
        if (matchesOnLeft + matchesOnRight > 1) {
            while(matchesOnRight !== 0) {
                this.state[row][column + matchesOnRight] = 0;
                matchesOnRight--;
            }
            while(matchesOnLeft !== 0) {
                this.state[row][column - matchesOnLeft] = 0;
                matchesOnLeft--;
            }
            this.state[row][column] = 0;
            hasMatch = true;
        }

        if (matchesAbove + matchesBelow > 1) {
            while(matchesAbove !== 0) {
                this.state[row + matchesAbove][column] = 0;
                matchesAbove--;
            }
            while(matchesBelow !== 0) {
                this.state[row - matchesBelow][column] = 0;
                matchesBelow--;
            }
            this.state[row][column] = 0;
            hasMatch = this;
        }
        if (hasMatch) 
            this.updateColumnOnMatch();
    }

    updateColumnOnMatch() {
        for (let i = 0; i < this.state.length; i++) {
          for (let j = 0; j < this.state[0].length - 1; j++) {
            // If the current element is zero
            if (this.state[j][i] === 0) {
              // Swap the current element with the element in the row below it
              this.state[j][i] = this.state[j + 1][i];
              this.state[j + 1][i] = 0;
            }
          }
        }
        // this.matchingAlgorithm();
    }

    clockLogic() {
        // game.clockTicks work in seconds
        this.elapsedTime += this.game.clockTick;
        // console.log(this.elapsedTime); // remove!!
        // console.log(this.gameSpeedUp);
        if (this.numUpdates > 3 && this.gameSpeedUp < 2.0) {
            this.gameSpeedUp += .1;
            this.numUpdates = 0;
        }
        if (this.elapsedTime * this.gameSpeedUp > 6) { 
            this.elapsedTime -= 6;
            this.numUpdates++;
            this.update();
        }
    }


    drawPlayer() {
        this.ctx.fillStyle = "Black";
        this.ctx.fillRect(this.playerX * 60, this.maxHeight - 60, 60, 60);

        // fill holding piece above player
        this.ctx.fillStyle = this.colors[this.holdingPiece];
        let radius = 30;
        let diameter = radius * 2;
        let startX = radius;
        this.ctx.beginPath();
        this.ctx.arc(startX + this.playerX * diameter, this.maxHeight - 90, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    draw() {
        this.clockLogic();
        this.drawRows();
        this.drawPlayer();
    }
}
