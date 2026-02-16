export class Laser {
  constructor(startX, startY, targetX, targetY, color) {
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.posX = startX;
    this.posY = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.speed = 10;
    this.image = new Image();
    this.color = color;
    if (this.color === "blue") {
      this.image.src = "src/assets/laser_blue.png";
    } else if (this.color === "red") {
      this.image.src = "src/assets/laser.png";
    } else if (this.color === "green") {
      this.image.src = "src/assets/laser_green.png";
    } else if (this.color === "missle") {
      this.image.src = "src/assets/missle.png";
    } else if (this.color === "sniper") {
      this.speed = 16;
    }

    this.loaded = false;
    this.image.onload = () => {
      this.loaded = true;
    };

    this.rotation = 0; // Add rotation property
  }

  update() {
    this.prevX = this.posX;
    this.prevY = this.posY;

    const dx = this.targetX - this.posX;
    const dy = this.targetY - this.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (this.color === "missle") {
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
    if (this.color === "sniper") {
      const angle = Math.atan2(
        this.targetY - this.posY,
        this.targetX - this.posX,
      );
      const tail = 16;

      ctx.save();
      ctx.strokeStyle = "rgba(255, 235, 140, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        this.posX - Math.cos(angle) * tail,
        this.posY - Math.sin(angle) * tail,
      );
      ctx.lineTo(this.posX, this.posY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 250, 190, 1)";
      ctx.beginPath();
      ctx.arc(this.posX, this.posY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.loaded) {
      ctx.save();
      ctx.translate(this.posX, this.posY); // Translate to the center of the laser
      ctx.rotate(this.rotation); // Apply rotation
      ctx.drawImage(this.image, -5, -5, 15, 25); // Draw the laser
      ctx.restore();
    }
  }
}
