export class Laser {
    constructor(startX, startY, targetX, targetY, color) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX + (Math.random() * 80 - 40);
        this.targetY = targetY;
        this.posX = startX;
        this.posY = startY;
        this.speed = 10;
        this.image = new Image();
        this.color = color;
        if(this.color === 'blue') {
            this.image.src = 'src/assets/laser_blue.png';
        }else if( this.color === 'red') {
            this.image.src = 'src/assets/laser.png';
        }else if(this.color === 'green') {
            this.image.src = 'src/assets/laser_green.png';
        }else if(this.color === 'missle') {
            this.image.src = 'src/assets/missle.png'; 
        }
       
        this.loaded = false;
        this.image.onload = () => {
            this.loaded = true;
        };

        this.rotation = 0; // Add rotation property
    }

    update() {
        const dx = this.targetX - this.posX;
        const dy = this.targetY - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(this.color === 'missle') {
            this.speed = 7;
        }
        if (distance < this.speed) {
            this.posX = this.targetX;
            this.posY = this.targetY;
        } else {
            this.posX += (dx / distance) * this.speed;
            this.posY += (dy / distance) * this.speed;
        }

        this.rotation += 0.1; // Update rotation
    }

    draw(ctx) {
        if (this.loaded) {
            ctx.save();
            ctx.translate(this.posX, this.posY); // Translate to the center of the laser
            ctx.rotate(this.rotation); // Apply rotation
            ctx.drawImage(this.image, -5, -5, 15, 25); // Draw the laser
            ctx.restore();
        }
    }
}