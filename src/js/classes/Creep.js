export class Creep {
  constructor(
    pos_x,
    pos_y,
    width,
    height,
    img_folder,
    scale = 1,
    waypoints,
    health,
    velocity,
    resistent,
    extra_money,
  ) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.width = width;
    this.height = height;
    this.scale = scale; // Skalierungsfaktor
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.direction = 1; // 1 für vorwärts, -1 für rückwärts
    this.markedForDeletion = false; // Markierung für Löschung
    this.health = health;
    this.maxHealth = health; // Speichern des maximalen Gesundheitswerts
    this.is_hit = false;
    this.hitFrameCounter = 0;
    this.is_toxicated = false;
    this.toxicated_lvl = 0.1;
    this.resistent = resistent;
    this.extra_money = extra_money;

    this.velocity = velocity;
    this.original_velocity = velocity; // Speichern der ursprünglichen Geschwindigkeit
    this.isSlowed = false; // Neue Eigenschaft, um zu verfolgen, ob der Gegner verlangsamt wurde
    this.slowTimeout = null; // Timeout-ID für den Verlangsamungseffekt

    this.imageIndex = 0; // Aktuelles Bild für die Animation
    this.imageFrames = []; // Array für die Bilder
    this.frameSpeed = 5; // Geschwindigkeit der Animation
    this.frameTick = 0;
    this.counter = 0;

    // Lade alle Bilder aus dem Ordner
    for (let i = 1; i <= 17; i++) {
      const img = new Image();
      img.src = `${img_folder}/frame_${i}.png`;
      this.imageFrames.push(img);
    }
  }

  applySlowEffect(slow_val, slow_time) {
    if (this.slowTimeout) {
      clearTimeout(this.slowTimeout); // Setze den Timer zurück, wenn der Gegner erneut getroffen wird
    }
    this.isSlowed = true;
    this.velocity = this.original_velocity * slow_val; // Verlangsamen auf den angegebenen Wert
    this.slowTimeout = setTimeout(() => {
      this.isSlowed = false;
      this.velocity = this.original_velocity;
    }, slow_time); // Verwende den übergebenen slow_time-Wert
  }

  update(save_obj, moneyPopups) {
    if (this.currentWaypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.currentWaypointIndex];
      const dx = target.x - 20 - this.pos_x; // Korrigiere den Versatz um 20 Pixel
      const dy = target.y - this.pos_y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.velocity) {
        this.pos_x = target.x - 20; // Setze die korrigierte Zielposition
        this.pos_y = target.y;
        this.currentWaypointIndex++;
      } else {
        this.pos_x += (dx / distance) * this.velocity;
        this.pos_y += (dy / distance) * this.velocity;
        this.direction = dx < 0 ? -1 : 1; // Setze die Richtung basierend auf dx
      }
      // console.log(this);
    }

    // Markiere den Creep zur Löschung, wenn er die Grenze überschreitet
    if (this.pos_x > 400) {
      this.markedForDeletion = true;
    }

    // Update frame index für die Animation
    this.frameTick++;
    if (this.frameTick >= this.frameSpeed) {
      this.frameTick = 0;
      this.imageIndex = (this.imageIndex + 1) % this.imageFrames.length; // Nächstes Bild
    }

    //* toxicated
    if (this.is_toxicated) {
        const now = Date.now();
        if (!this.lastToxicEffect || now - this.lastToxicEffect >= 1000) { // Alle 1 Sekunde
            this.lastToxicEffect = now;
            this.health -= (this.toxicated_lvl * 50);
    
            if (this.health <= 0) {
                // Generiere Geld, bevor der Creep gelöscht wird
                if (!this.markedForDeletion) {
                    save_obj.money += 10; // Beispiel: 10 Geld für jeden toten Creep
                    moneyPopups.push({
                        x: this.pos_x,
                        y: this.pos_y,
                        amount: `+10`,
                        opacity: 1, // Start-Deckkraft
                    });
                }
                this.markedForDeletion = true;
            }
        }
    }
  }

  draw(ctx) {
    const currentImage = this.imageFrames[this.imageIndex];
    if (currentImage.complete) {
        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scale;

        ctx.save();
        if (this.direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                currentImage,
                -this.pos_x - scaledWidth,
                this.pos_y,
                scaledWidth,
                scaledHeight
            );
        } else {
            ctx.drawImage(
                currentImage,
                this.pos_x,
                this.pos_y,
                scaledWidth,
                scaledHeight
            );
        }
        ctx.restore();

        // Zeichne die Lebensanzeige
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        const healthBarX = this.pos_x + scaledWidth / 2 - healthBarWidth / 2;
        const healthBarY = this.pos_y - 10;

        ctx.fillStyle = "red";
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        ctx.fillStyle = "green";
        ctx.fillRect(
            healthBarX,
            healthBarY,
            (this.health / this.maxHealth) * healthBarWidth,
            healthBarHeight
        );

        // Zeichne einen grünen Punkt, wenn der Gegner toxicated ist
        if (this.is_toxicated) {
            const dotX = healthBarX + healthBarWidth / 2; // Punkt zentrieren
            const dotY = healthBarY + healthBarHeight + 5; // Unter der Lebensanzeige
            const dotRadius = 1; // Radius des Punkts

            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2); // Kreis zeichnen
            ctx.fillStyle = "green";
            ctx.fill();
            ctx.closePath();
        }
    }
}
}
