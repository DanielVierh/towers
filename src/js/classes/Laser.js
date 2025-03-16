export class Laser {
    constructor(startX, startY, targetX, targetY, color) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.posX = startX;
        this.posY = startY;
        this.speed = 4;
        this.image = new Image();
        this.color = color;
        if(this.color === 'blue') {
            this.image.src = 'src/assets/laser_blue.png';
        }else if( this.color === 'red') {
            this.image.src = 'src/assets/laser.png';
        }
       
        this.loaded = false;
        this.image.onload = () => {
            this.loaded = true;
        };
    }

    update() {
        const dx = this.targetX - this.posX;
        const dy = this.targetY - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.posX = this.targetX;
            this.posY = this.targetY;
        } else {
            this.posX += (dx / distance) * this.speed;
            this.posY += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.posX, this.posY, 10, 10);
        }
    }
}