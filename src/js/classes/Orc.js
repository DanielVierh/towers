export class Orc {
    constructor(pos_x, pos_y, width, height, img_src, scale = 1, waypoints, health) {
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = img_src;
        this.image.onload = () => {
            this.loaded = true;
        };
        this.velocity = 2;
        this.color = 'red';
        this.frameIndex = 0;
        this.frameCount = 7; // Anzahl der Frames in der Sprite
        this.frameWidth = 742 / this.frameCount; // Breite eines einzelnen Frames
        this.frameHeight = this.height; // Höhe eines einzelnen Frames
        this.frameSpeed = 5; // Geschwindigkeit der Animation
        this.frameTick = 0;
        this.scale = scale; // Skalierungsfaktor
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.direction = 1; // 1 für vorwärts, -1 für rückwärts
        this.markedForDeletion = false; // Markierung für Löschung
        this.health = health;
    }

    update() {
        if (this.currentWaypointIndex < this.waypoints.length) {
            const target = this.waypoints[this.currentWaypointIndex];
            const dx = target.x - this.pos_x;
            const dy = target.y - this.pos_y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.velocity) {
                this.pos_x = target.x;
                this.pos_y = target.y;
                this.currentWaypointIndex++;
            } else {
                this.pos_x += (dx / distance) * this.velocity;
                this.pos_y += (dy / distance) * this.velocity;
                this.direction = dx < 0 ? -1 : 1; // Setze die Richtung basierend auf dx
            }
        }

        // Markiere den Orc zur Löschung, wenn er die Grenze überschreitet
        if (this.pos_x > 400) {
            this.markedForDeletion = true;
        }

        // Update frame index für die Animation
        this.frameTick++;
        if (this.frameTick >= this.frameSpeed) {
            this.frameTick = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
        }
    }

    draw(ctx) {
        if (this.loaded) {
            const sx = this.frameIndex * this.frameWidth;
            const sy = 0;
            const scaledWidth = this.width * this.scale;
            const scaledHeight = this.height * this.scale;

            ctx.save();
            if (this.direction === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, -this.pos_x - scaledWidth, this.pos_y, scaledWidth, scaledHeight);
            } else {
                ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, this.pos_x, this.pos_y, scaledWidth, scaledHeight);
            }
            ctx.restore();
        }
    }
}