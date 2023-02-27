// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
        this.gameDisplay = new GameDisplay(this);
        this.gameDisplay.init(ctx);
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        // this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener('keydown', e => {
            let gd = this.gameDisplay;
            let currentX = gd.playerX;
            let maxX = Math.floor(gd.maxWidth / 60) - 1;
            switch (e.code) {
                case 'ArrowLeft':
                    if (currentX > 0) gd.playerX--;
                    break;
                case 'ArrowRight':
                    if (currentX < maxX) gd.playerX++;
                    break;
                case 'Space':
                   // console.log("key: ", e.code);
                    if (gd.currentColor === 0) {
                        console.log(gd.matrix);
                        for (let i = 9; i >= 0; i--) {
                            if (gd.pieceCount === 0 && gd.matrix[i][gd.playerX] !== 0) {
                                gd.currentColor = gd.matrix[i][gd.playerX];
                                gd.matrix[i][gd.playerX] = 0;
                                gd.pieceCount++;
                            }
                       } 
                    } else { 
                        for (let i = 0; i < 10; i++) {
                            if (gd.matrix[i][gd.playerX] === 0) {
                                gd.matrix[i][gd.playerX] = gd.currentColor;
                                gd.eliminateCircles(i, gd.playerX);
                                break;
                            }
                        }
                        gd.currentColor = 0;
                        gd.pieceCount = 0;
                    }
                    // while (true) {
                    //     let i = 9;
                    //     if (gd.pieceCount === 0) {
                    //         if (gd.matrix[i][gd.playerX] !== 0) {
                    //             gd.currentColor = gd.matrix[i][gd.playerX];
                    //             gd.matrix[i][gd.playerX] = 0;
                    //             gd.pieceCount++;
                    //         } else {
                    //             i--;
                    //         }
                    //     } else if (gd.pieceCount > 0) {
                    //         if (gd.matrix[i][gd.playerX] == gd.currentColor) {
                    //             gd.matrix[i][gd.playerX] = 0;
                    //             gd.pieceCount++;
                    //             if (gd.pieceCount > 1) break;
                    //         }
                    //     }

                    // }
                    this.draw();
                    break;
                default:
                    break;
            }
        })
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        console.log("draw happened here!!!");
        this.gameDisplay.draw();

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

};
