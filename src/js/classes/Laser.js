export class Laser {
  constructor(startX, startY, targetX, targetY, color, options = {}) {
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
    this.targetRef = options?.targetRef ?? null;
    this.finished = false;
    this.hitRadius = Number(options?.hitRadius) || 12;
    this.drawnBeamColors = ["blue", "red", "green"];

    this.rotation = 0;
    this.glowColor = "rgba(255,255,255,0.8)";

    if (this.color === "blue") {
      this.speed = 9;
      this.glowColor = "rgba(120, 180, 255, 0.95)";
    } else if (this.color === "red") {
      this.speed = 12;
      this.glowColor = "rgba(255, 105, 105, 0.95)";
    } else if (this.color === "green") {
      this.speed = 10;
      this.glowColor = "rgba(120, 255, 160, 0.95)";
    }

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
      this.hitRadius = Math.max(this.hitRadius, 10);
    }

    this.loaded = false;
    this.image.onload = () => {
      this.loaded = true;
    };
  }

  update() {
    if (this.finished) return;

    this.prevX = this.posX;
    this.prevY = this.posY;

    if (this.targetRef && !this.targetRef.markedForDeletion) {
      const targetCenterX =
        this.targetRef.pos_x + (Number(this.targetRef.width) || 0) / 2;
      const targetCenterY =
        this.targetRef.pos_y + (Number(this.targetRef.height) || 0) / 2;

      if (Number.isFinite(targetCenterX) && Number.isFinite(targetCenterY)) {
        this.targetX = targetCenterX;
        this.targetY = targetCenterY;
        this.hitRadius = Math.max(
          this.hitRadius,
          (this.targetRef.width || 0) * 0.25,
        );
      }
    }

    const dx = this.targetX - this.posX;
    const dy = this.targetY - this.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (this.color === "missle") {
      this.speed = 7;
    }

    if (distance <= this.speed + this.hitRadius) {
      this.posX = this.targetX;
      this.posY = this.targetY;
      this.finished = true;
    } else {
      this.posX += (dx / distance) * this.speed;
      this.posY += (dy / distance) * this.speed;
    }

    this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
  }

  draw(ctx) {
    if (this.finished) return;

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

    if (this.drawnBeamColors.includes(this.color)) {
      const dx = this.posX - this.prevX;
      const dy = this.posY - this.prevY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const tail = this.color === "red" ? 20 : 16;

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.glowColor;

      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = this.color === "red" ? 3.2 : 2.6;
      ctx.beginPath();
      ctx.moveTo(this.posX - nx * tail, this.posY - ny * tail);
      ctx.lineTo(this.posX, this.posY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(
        this.posX,
        this.posY,
        this.color === "red" ? 2.6 : 2.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.restore();
      return;
    }

    if (this.loaded) {
      ctx.save();
      ctx.translate(this.posX, this.posY);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.image, -5, -5, 15, 25);
      ctx.restore();
    }
  }
}
