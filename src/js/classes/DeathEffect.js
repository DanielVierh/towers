export class DeathEffect {
  constructor(x, y, scale = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = 0.15;
    this.frames = [];
    this.frameIndex = 0;
    this.frameInterval = 20; // Zeit pro Frame in ms
    this.lastFrameTime = 0;
    this.loaded = false;
    this.finished = false;
    this.spawnedBlood = false;
    this.markedForDeletion = false;

    // Explosion-Bilder laden
    this.loadFrames();
  }

  loadFrames() {
    const frameCount = 10;
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `src/assets/creep_explosion/Explosion_${i}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          this.loaded = true;
        }
      };
      img.onerror = () =>
        console.error(`Fehler beim Laden von Explosion_${i}.png`);
      this.frames.push(img);
    }
  }

  update(deltaTime) {
    if (!this.loaded || this.finished) return;

    this.lastFrameTime += deltaTime;
    if (this.lastFrameTime >= this.frameInterval) {
      this.frameIndex++;
      this.lastFrameTime = 0;

      if (this.frameIndex >= this.frames.length) {
        this.finished = true;

        // etwas warten, bevor markiert wird
        setTimeout(() => (this.markedForDeletion = true), 100);
      }
    }
  }

  draw(ctx) {
    if (!this.loaded || this.finished) return;

    const img = this.frames[this.frameIndex];
    if (!img || !img.complete) return;

    const width = img.width * this.scale;
    const height = img.height * this.scale;
    ctx.drawImage(img, this.x - width / 2, this.y - height / 2, width, height);
  }
}
