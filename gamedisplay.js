class GameDisplay {

    constructor(game) {
        this.ctx = null;
        this.game = game;
        // this.running = true;
        // pink = 1, blue = 2,  red = 3, green = 4, purple = 5
        this.colors = ["white","Pink", "Blue", "Red", "Green","Purple"];
        this.allColors = 5;
        this.rowNum = 9; 
        this.matrix = null;
        this.currentScore = null;

        this.elapsedTime = 0;
        this.gameSpeedUp = 1;
        this.numUpdates = 0;

        this.canvasSize = document.getElementById('gameWorld');
        this.maxWidth = this.canvasSize.getAttribute('width');
        this.maxHeight = this.canvasSize.getAttribute('height');
        this.playerX = 0;

        this.stateChanged = false;
        this.currentColor = 0;
        this.pieceCount = 0;


    }

    init(ctx) { 
        this.ctx = ctx;
        this.matrix = Array(10).fill(Array(10).fill(0)) 
        this.currentScore = 0;
    }

    isGameOver() {
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[this.rowNum][i] !== 0) 
            return true;
        }
        return false; 
    }

    update() {
        if (!this.isGameOver()) {
            this.updateMatrix();
            let newRow = this.makeRow();
            for (let i = 0; i < newRow.length; i++) {
                this.matrix[0][i] = newRow[i];
            }
            this.draw();
        } else {
            alert("Game Over");
        }
    }


    updateMatrix() {
        let updatedMatrix = Array(10).fill(Array(10));
        for (let i = 0; i < this.matrix.length - 1; i++) {
            updatedMatrix[i + 1] = this.matrix[i].slice(); 
        }
        this.matrix = updatedMatrix;
        this.lowestRow++;
    }

    // randomIntFromInterval(min, max) {
    //     return Math.floor(Math.round() * (max - min + 1) + min);
    // }

    makeRow() {
        let newRow = Array(10);
        let leftCircle = 0;
        let topCircle = 0;
        for (let i = 0; i < newRow.length; i++) {
            topCircle = this.matrix[1][i];
            let curr = Math.floor(Math.random() * this.allColors) + 1
            if (leftCircle === curr || topCircle === curr) {
                i--;
                continue;
            }
            leftCircle = curr;
            newRow[i] = curr;
        }
        return newRow;
    }

    drawRows() {
        let radius = 30;
        let startX = radius;
        let startY = radius;
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix.length; j++) {
                this.ctx.fillStyle = this.colors[this.matrix[i][j]];
                this.ctx.beginPath();
                this.ctx.arc(startX + j * radius, startY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                startX += radius;
            }
            startY += radius * 2;
            startX = radius; 
        }
    }

    eliminateCircles(row, column) {
        
        let curr = this.matrix[row][column];
        let matchesOnRight = 0;
        let matchesOnLeft = 0;
        let matchesAbove = 0;
        let matchesBelow = 0;
        
        for (let i = column + 1; i <= this.rowNum; i++) {
            if (this.matrix[row][i] !== curr) {
                break;
            }
            matchesOnRight++;
        }

        for (let j = column - 1; j >= 0; j--) {
            if (this.matrix[row][j] !== curr) {
                break;
            }
            matchesOnLeft++;
        }

        for (let k = row + 1; k <= this.rowNum; k++) {
            if (this.matrix[k][column] !== curr) {
                break;
            }
            matchesAbove++;
        }

        for (let r = row - 1; r >= 0; r--) {
            if (this.matrix[r][column] !== curr) {
                break;
            }
            matchesBelow++;
        }

        if (matchesOnLeft + matchesOnRight + matchesAbove + matchesBelow > 1) {
            while(matchesOnRight !== 0) {
                this.matrix[row][column + matchesOnRight] = 0;
                matchesOnRight--;
            }
            while(matchesOnLeft !== 0) {
                this.matrix[row][column - matchesOnLeft] = 0;
                matchesOnLeft--;
            }
            while(matchesAbove !== 0) {
                this.matrix[row + matchesAbove][column] = 0;
                matchesAbove--;
            }
            while(matchesBelow !== 0) {
                this.matrix[row - matchesBelow][column] = 0;
                matchesBelow--;
            }
            this.matrix[row][column] = 0;
            this.updateColumnOnMatch();
        }
    }



    updateColumnOnMatch() {
        for (let i = 0; i < this.matrix.length; i++) {
          for (let j = 0; j < this.matrix[0].length - 1; j++) {
            // If the current element is zero
            if (this.matrix[j][i] === 0) {
              // Swap the current element with the element in the row below it
              this.matrix[j][i] = this.matrix[j + 1][i];
              this.matrix[j + 1][i] = 0;
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
        if (this.elapsedTime * this.gameSpeedUp > 1) { 
            this.elapsedTime -= 6;
            this.numUpdates++;
            this.update();
        }
    }


    drawPlayer() {
        this.ctx.fillStyle = "Black";
        this.ctx.fillRect(this.playerX * 60, this.maxHeight - 60, 60, 60);

        // fill holding piece above player
        this.ctx.fillStyle = this.colors[this.currentColor];
        let radius = 30;
        let diameter = radius * 2;
        let startX = radius + this.playerX * diameter;
        this.ctx.beginPath();
        this.ctx.arc(startX, this.maxHeight - 90, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // draw player line
        let lowestZero = 0;
        this.ctx.strokeStyle = "Thistyle";
        while (lowestZero <= this.rowNum && this.matrix[lowestZero][this.playerX] !== 0) {
            lowestZero++;
        }
        this.ctx.beginPath();
        this.ctx.setLineDash([20, 5]);
        this.ctx.moveTo(startX, 60 * lowestZero);
        this.ctx.lineTo(startX, 60 * (this.rowNum + 1));
        this.ctx.stroke();
    }

    draw() {
        this.clockLogic();
        this.drawRows();
        this.drawPlayer();
    }
}
