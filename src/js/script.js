import { Orc } from "./classes/Orc.js";
import { Laser } from "./classes/Laser.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const lbl_Money = document.getElementById("lbl_money");
const lbl_Live = document.getElementById("lbl_live");
const lbl_WaveTimer = document.getElementById("lbl_wave_timer");
const lbl_wave = document.getElementById("lbl_wave");

canvas.width = 400;
canvas.height = 400;

const waypoints = [
  { x: 50, y: 20 },
  { x: 350, y: 20 },
  { x: 350, y: 100 },
  { x: 30, y: 100 },
  { x: 30, y: 180 },
  { x: 350, y: 180 },
  { x: 350, y: 260 },
  { x: 30, y: 260 },
  { x: 30, y: 340 },
  { x: 450, y: 340 },
];

const tower_places = [
  { x: 70, y: 10, is_tower: false },
  { x: 260, y: 10, is_tower: false },
  { x: 160, y: 85, is_tower: false  },
  { x: 90, y: 165, is_tower: false },
  { x: 250, y: 245, is_tower: false },
  { x: 130, y: 330, is_tower: false },
  { x: 350, y: 330, is_tower: false  },
  { x: 280, y: 165, is_tower: false  },
  { x: 90, y: 245, is_tower: false  },
];

const enemies = [];
const lasers = [];
const towerImage = new Image();
towerImage.src = "src/assets/tower2.png";
let live = 20;
let waveTimer = 30; // Timer für die nächste Welle in Sekunden
let money = 100;
let max_enemy_amount = 3;
let wave = 0;


//* Spawn Enemies
function spawnEnemy() {
  for (let i = 1; i < max_enemy_amount; i++) {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 80;
    const imgSrc = "src/assets/orc.png";
    const scale = 0.6;
    const health = Math.floor(Math.random() * (250 - 90 + 1)) + 90;
    const velocity = Math.random() * (5 - 1) + 1;
    enemies.push(
      new Orc(
        posX,
        posY,
        width,
        height,
        imgSrc,
        scale,
        waypoints,
        health,
        velocity
      )
    );
  }
}

function drawWaypoints() {
  ctx.strokeStyle = "beige";
  ctx.lineWidth = 30;
  ctx.beginPath();
  waypoints.forEach((waypoint, index) => {
    const adjustedY = waypoint.y + 40; // Verschiebe die y-Koordinate um 50 Pixel nach unten
    if (index === 0) {
      ctx.moveTo(waypoint.x, adjustedY);
    } else {
      ctx.lineTo(waypoint.x, adjustedY);
    }
    ctx.arc(waypoint.x, adjustedY, 5, 0, Math.PI * 2);
  });
  ctx.stroke();
}

function drawTowerPlaces() {
  ctx.fillStyle = "black";
  tower_places.forEach((place) => {
    if (place.is_tower) {
      ctx.drawImage(towerImage, place.x, place.y, 30, 30);
    } else {
      ctx.fillRect(place.x, place.y, 30, 30);
    }
  });
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Zuerst die Waypoints zeichnen
  drawWaypoints();

  // Tower Places zeichnen
  drawTowerPlaces();

  lbl_Money.innerHTML = `${money}€`;
  lbl_Live.innerHTML = `${live} Leben`;
  lbl_wave.innerHTML = `Welle: ${wave}`;

  // Dann die Orcs darüber zeichnen
  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.is_hit = false; // Reset is_hit before checking towers

    // Markiere den Orc zur Löschung, wenn er die Grenze überschreitet
    if (enemy.pos_x > 400) {
      enemy.markedForDeletion = true;
      live--;
    }

    // Überprüfen, ob der Orc in der Nähe eines Turms ist
    tower_places.forEach((place) => {
      if (place.is_tower) {
        const distance = calculateDistance(
          enemy.pos_x,
          enemy.pos_y,
          place.x,
          place.y
        );

        // Zeichne den Radius um den Turm
        // ctx.beginPath();
        // ctx.arc(place.x + 15, place.y + 15, 80, 0, Math.PI * 2);
        // ctx.strokeStyle = 'rgba(255, 0, 0, 0.1)';
        // ctx.lineWidth = .5;
        // ctx.stroke();

        if (distance < 80) {
          // Radius von 80 Pixeln
          enemy.health -= 1; // Schaden anwenden
          enemy.is_hit = true;

          if (enemy.health <= 0) {
            enemy.markedForDeletion = true;
            money += 5;
          }

          // Erzeuge einen Laser
          lasers.push(
            new Laser(place.x + 15, place.y, enemy.pos_x, enemy.pos_y)
          );
        }
      }
    });

    if (!enemy.is_hit) {
      enemy.hitFrameCounter = 0; // Reset the hit frame counter
    }

    if (enemy.markedForDeletion) {
      enemies.splice(index, 1);
    } else {
      enemy.draw(ctx);
    }
  });

  // Update und zeichne die Laser
  lasers.forEach((laser, index) => {
    laser.update();
    laser.draw(ctx);

    // Entferne den Laser, wenn er das Ziel erreicht hat
    if (laser.posX === laser.targetX && laser.posY === laser.targetY) {
      lasers.splice(index, 1);
    }
  });

  setTimeout(() => {
    gameLoop();
  }, 20);
}

function updateWaveTimer() {
  waveTimer--;
  lbl_WaveTimer.innerHTML = `${wave + 1}. Welle in ${waveTimer}s`;
  if (waveTimer <= 0) {
    waveTimer = 30; // Reset the timer for the next wave
    spawnEnemy();
    wave++;
    if (wave > 5) {
        max_enemy_amount += Math.floor(wave / 2);
    } else {
        max_enemy_amount += wave;
    }
   
  }
}

// Event-Listener for click on Tower Place
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  tower_places.forEach((place) => {
    if (
      x >= place.x &&
      x <= place.x + 30 &&
      y >= place.y &&
      y <= place.y + 30
    ) {
      console.log("Tower place clicked:", place);
        if(money >= 50) {
            if (!place.is_tower) {
                place.is_tower = true;
                money -= 50;
            }
        }
    }
  });
});

// Start the game loop
gameLoop();

// Update the wave timer every second
setInterval(updateWaveTimer, 1000);
