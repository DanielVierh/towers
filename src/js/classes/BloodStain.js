export class BloodStain {
  constructor(x, y, img_src, scale = 1) {
    this.x = x;
    this.y = y + 15;
    this.scale = scale;

    this.image = new Image();
    this.image.src = img_src;

    this.spawnTime = Date.now();
    this.lifeTime = 60000; // 60 Sekunden
    this.markedForDeletion = false;
  }

  update() {
    const elapsed = Date.now() - this.spawnTime;

    if (elapsed >= this.lifeTime) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const elapsed = Date.now() - this.spawnTime;
    let alpha = Math.max(1 - elapsed / this.lifeTime, 0);
    alpha = alpha * alpha; // eleganteres Ausfaden

    ctx.save();
    ctx.globalAlpha = alpha;

    const size = 40 * this.scale;

    ctx.drawImage(this.image, this.x - size / 2, this.y - size / 2, size, size);

    ctx.restore();
  }
}
