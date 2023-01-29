class NewRow {

    constructor() {
        this.ctx = null;
        this.colors = ["Pink", "Yellow", "Red", "Green", "Purple", "Blue"];
        this.currentRow = null;
    }

    init(ctx) { 
        this.ctx = ctx;
    }

    makeRow(ctx) {
        let radius = 30;
        let startX = radius;
        for (let i = 0; i < 10; i++) {
            let rand = Math.floor(Math.random() * 9);
            ctx.fillStyle = this.colors[rand % this.colors.length];
            ctx.beginPath();
            ctx.arc(startX + i * radius, radius, radius, 0, 2 * Math.PI); 
            ctx.fill();
            startX += 30;   
        }
    }

    makeGird() {
        
    }

    draw(ctx) {
        this.makeRow(ctx);
    }
}