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
    invisible,
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
    this.empDisabledUntil = 0;
    this.isEmpDisabled = false;

    this.imageIndex = 0; // Aktuelles Bild für die Animation
    this.imageFrames = []; // Array für die Bilder
    this.frameSpeed = 1; // Geschwindigkeit der Animation 5 = eher langsam, 3 = schneller, 1 = schnell
    this.frameTick = 0;
    this.counter = 0;
    this.invisible = invisible;
    this.wasInvisible = Boolean(invisible);
    this.isPathfinderPath = false;

    // Smooth HP bar (rendered health lags behind actual health)
    this.displayHealth = health;

    // Shield
    this.shieldHealth = 0;
    this.maxShieldHealth = 0;
    this.displayShieldHealth = 0;

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

  applyEmpEffect(disableMs = 1800) {
    const now = Date.now();
    this.empDisabledUntil = Math.max(
      this.empDisabledUntil || 0,
      now + disableMs,
    );
    this.isEmpDisabled = true;
  }

  update(save_obj, moneyPopups) {
    const nowEpoch = Date.now();
    this.isEmpDisabled = nowEpoch < (Number(this.empDisabledUntil) || 0);

    // Smooth HP bar easing
    if (typeof this.displayHealth !== "number")
      this.displayHealth = this.health;
    // quick but smooth (frame-based easing)
    this.displayHealth += (this.health - this.displayHealth) * 0.12;
    if (Math.abs(this.displayHealth - this.health) < 0.05) {
      this.displayHealth = this.health;
    }

    // Smooth Shield bar easing
    if (typeof this.displayShieldHealth !== "number")
      this.displayShieldHealth = this.shieldHealth;
    this.displayShieldHealth +=
      (this.shieldHealth - this.displayShieldHealth) * 0.12;
    if (Math.abs(this.displayShieldHealth - this.shieldHealth) < 0.05) {
      this.displayShieldHealth = this.shieldHealth;
    }

    if (this.currentWaypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.currentWaypointIndex];
      const halfW = (this.width * this.scale) / 2;
      const halfH = (this.height * this.scale) / 2;
      const offsetX = this.isPathfinderPath ? halfW : 20; // pathfinder nodes are centered on cell
      const offsetY = this.isPathfinderPath ? halfH : 0;
      const dx = target.x - offsetX - this.pos_x;
      const dy = target.y - offsetY - this.pos_y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const moveVelocity = this.isEmpDisabled ? 0 : this.velocity;
      if (distance < moveVelocity) {
        this.pos_x = target.x - offsetX; // Setze die korrigierte Zielposition
        this.pos_y = target.y - offsetY;
        this.currentWaypointIndex++;
      } else if (moveVelocity > 0) {
        this.pos_x += (dx / distance) * moveVelocity;
        this.pos_y += (dy / distance) * moveVelocity;
        this.direction = dx < 0 ? -1 : 1; // Setze die Richtung basierend auf dx
      }
      // console.log(this);
    }

    // Markiere den Creep zur Löschung, wenn er die Grenze überschreitet
    if (!this.disableBoundaryDeletion && this.pos_x > 400) {
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
      if (!this.lastToxicEffect || now - this.lastToxicEffect >= 1000) {
        // Alle 1 Sekunde
        this.lastToxicEffect = now;
        this.applyDamage(this.toxicated_lvl * 50);

        if (this.health <= 0) {
          // Generiere Geld, bevor der Creep gelöscht wird
          if (!this.markedForDeletion) {
            save_obj.money += 300;
            moneyPopups.push({
              x: this.pos_x,
              y: this.pos_y,
              amount: `+300`,
              opacity: 1, // Start-Deckkraft
            });
          }
          this.markedForDeletion = true;
        }
      }
    }
  }

  draw(ctx) {
    if (this.invisible) return; // Unsichtbare Creeps bleiben weiterhin komplett unsichtbar

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
          scaledHeight,
        );
      } else {
        ctx.drawImage(
          currentImage,
          this.pos_x,
          this.pos_y,
          scaledWidth,
          scaledHeight,
        );
      }
      ctx.restore();

      // Shield-Aura (blauer pulsierender Ring, solange Schild aktiv)
      if (this.shieldHealth > 0) {
        const centerX = this.pos_x + scaledWidth / 2;
        const centerY = this.pos_y + scaledHeight / 2;

        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);

        const radius = Math.max(scaledWidth, scaledHeight) / 2 + 8;
        const glowRadius = radius + pulse * 4;

        ctx.save();

        // leichte Ellipse = wirkt räumlicher
        ctx.translate(centerX, centerY);
        ctx.scale(1, 0.88);

        // Outer Glow
        ctx.shadowBlur = 25 + pulse * 10;
        ctx.shadowColor = "rgba(80,160,255,0.9)";

        // Energiefeld
        const gradient = ctx.createRadialGradient(
          0,
          0,
          radius * 0.4,
          0,
          0,
          glowRadius,
        );

        gradient.addColorStop(0, "rgba(120,200,255,0.02)");
        gradient.addColorStop(0.65, "rgba(120,200,255,0.08)");
        gradient.addColorStop(0.9, "rgba(120,200,255,0.22)");
        gradient.addColorStop(1, "rgba(180,230,255,0.6)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Haupt-Ring
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(180,220,255,${0.7 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Innerer Ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Lichtreflex oben links
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI * 0.85, -Math.PI * 0.35);
        ctx.stroke();

        ctx.restore();
      }

      // Zeichne die Lebensanzeige
      const healthBarWidth = 40;
      const healthBarHeight = 5;
      const healthBarX = this.pos_x + scaledWidth / 2 - healthBarWidth / 2;
      const healthBarY = this.pos_y - 10;

      ctx.fillStyle = "red";
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      ctx.fillStyle = "green";
      const clampedDisplayHealth = Math.max(
        0,
        Math.min(this.maxHealth, this.displayHealth ?? this.health),
      );
      ctx.fillRect(
        healthBarX,
        healthBarY,
        (clampedDisplayHealth / this.maxHealth) * healthBarWidth,
        healthBarHeight,
      );

      // Schild-Bar (schwarzer Hintergrund, blaue Füllung)
      const shieldBarGap = 3;
      const shieldBarY = healthBarY + healthBarHeight + shieldBarGap;
      if (this.maxShieldHealth > 0) {
        ctx.fillStyle = "#111";
        ctx.fillRect(healthBarX, shieldBarY, healthBarWidth, healthBarHeight);

        const clampedDisplayShield = Math.max(
          0,
          Math.min(
            this.maxShieldHealth,
            this.displayShieldHealth ?? this.shieldHealth,
          ),
        );
        ctx.fillStyle = "rgba(60, 140, 255, 0.9)";
        ctx.fillRect(
          healthBarX,
          shieldBarY,
          (clampedDisplayShield / this.maxShieldHealth) * healthBarWidth,
          healthBarHeight,
        );
      }

      // Status icons (slow / toxic / invisible-type)
      const icons = [];
      if (this.isSlowed) icons.push({ color: "rgba(90,180,255,0.95)" });
      if (this.isEmpDisabled) icons.push({ color: "rgba(255,215,90,0.95)" });
      if (this.is_toxicated) icons.push({ color: "rgba(80,220,120,0.95)" });
      // show invisible icon only after reveal (type indicator)
      if (this.wasInvisible && !this.invisible) {
        icons.push({ color: "rgba(185,120,255,0.95)" });
      }

      if (icons.length) {
        const iconRadius = 2.2;
        const iconGap = 6;
        const rowWidth = (icons.length - 1) * iconGap;
        const baseX = healthBarX + healthBarWidth / 2 - rowWidth / 2;
        // shift icons below shield bar when present
        const baseY =
          this.maxShieldHealth > 0
            ? shieldBarY + healthBarHeight + 4
            : healthBarY + healthBarHeight + 7;

        icons.forEach((icon, idx) => {
          const x = baseX + idx * iconGap;
          ctx.beginPath();
          ctx.arc(x, baseY, iconRadius, 0, Math.PI * 2);
          ctx.fillStyle = icon.color;
          ctx.fill();
          ctx.closePath();
        });
      }

      // zeichne einen rahmen um den Creep
      // ctx.strokeStyle = "black";
      // ctx.lineWidth = 1;
      // ctx.strokeRect(
      //     this.pos_x,
      //     this.pos_y,
      //     scaledWidth,
      //     scaledHeight
      // );
    }
  }

  applyDamage(amount) {
    if (this.shieldHealth > 0) {
      const absorbed = Math.min(this.shieldHealth, amount);
      this.shieldHealth -= absorbed;
      amount -= absorbed;
    }
    this.health -= amount;
  }

  setPath(path) {
    if (!path || path.length === 0) return;
    // Path is expected to be an array of {x,y} points in pixel coordinates
    this.waypoints = path;
    this.currentWaypointIndex = 0;
    this.isPathfinderPath = true;
  }
}
