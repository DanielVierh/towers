import { Orc } from "./classes/Orc.js";
import { Laser } from "./classes/Laser.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const lbl_Money = document.getElementById("lbl_money");
const lbl_Live = document.getElementById("lbl_live");
const lbl_WaveTimer = document.getElementById("lbl_wave_timer");
const lbl_wave = document.getElementById("lbl_wave");
const gameOverModal = document.getElementById("gameOverModal");
const closeModal = document.getElementById("closeModal");
const mdl_towers = document.getElementById("mdl_towers");
const btn_close_modal_towers = document.getElementById(
  "btn_close_modal_towers"
);
const btn_Slower = document.getElementById("btn_Slower");
const btn_Destroyer = document.getElementById("btn_Destroyer");
const btn_close_modal_upgrade = document.getElementById(
  "btn_close_modal_upgrade"
);
const mdl_upgrade = document.getElementById("mdl_upgrade");
const towerImages = new Map();

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
  {
    x: 70,
    y: 10,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 260,
    y: 10,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 160,
    y: 85,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 90,
    y: 165,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 250,
    y: 245,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 130,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 350,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 280,
    y: 165,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
  {
    x: 90,
    y: 245,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
  },
];

const enemies = [];
const lasers = [];
const backgroundImage = new Image();
backgroundImage.src = "src/assets/bg/backgr2.png";
let live = 20;
let waveTimer = 10; // Timer für die nächste Welle in Sekunden
let money = 5000;
let max_enemy_amount = 3;
let wave = 0;
let enemy_max_health = 300;
let enemy_max_velocity = 2;
let tower = undefined;

function spawnEnemy() {
  for (let i = 1; i < max_enemy_amount; i++) {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 80;
    const imgSrc = "src/assets/orc.png";
    const scale = 0.6;
    const health =
      Math.floor(
        Math.random() * (enemy_max_health - enemy_max_health / 2 + 1)
      ) +
      enemy_max_health / 2;
    const velocity = Math.random() * (enemy_max_velocity - 1) + 1;
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
  ctx.strokeStyle = "rgb(97,59,33)";
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
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  tower_places.forEach((tower) => {
    if (tower.tower_is_build) {
      const towerImage = towerImages.get(tower.tower_img);
      if (towerImage) {
        ctx.drawImage(towerImage, tower.x, tower.y, 30, 30);
      }
    } else {
      ctx.fillRect(tower.x, tower.y, 30, 30);
    }
  });
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function showGameOverModal() {
  gameOverModal.style.display = "block";
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hintergrundbild zeichnen
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

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

    // Markiere den Orc zur Löschung, wenn er die Grenze überschreitet
    if (enemy.pos_x > 400) {
      enemy.markedForDeletion = true;
      live--;
    }

    // Überprüfen, ob der Orc in der Nähe eines Turms ist
    tower_places.forEach((tower) => {
      if (tower.tower_is_build) {
        const distance = calculateDistance(
          enemy.pos_x,
          enemy.pos_y,
          tower.x,
          tower.y
        );

        if (distance < tower.range) {
          // Radius von 80 Pixeln

          if (enemy.health <= 0) {
            enemy.markedForDeletion = true;

            if (wave > 10) {
              money += 1;
            } else if (wave >= 4) {
              money += 2;
            } else {
              money += 10;
            }
          }

          // Verlangsamen des Gegners, wenn er von einem Slower-Turm getroffen wird
          if (tower.tower_type === "slower") {
            console.log('is Slow Tower');
            
            let slow_val = 0.5;
            let slow_time = 10000;
            if (tower.tower_damage_lvl === 1) {
              slow_val = 0.4;
              slow_time = 12000;
            } else if (tower.tower_damage_lvl === 2) {
              slow_val = 0.3;
              slow_time = 14000;
            } else if (tower.tower_damage_lvl === 3) {
              slow_val = 0.2;
              slow_time = 16000;
            }
            enemy.applySlowEffect(slow_val, slow_time); // Verlangsamen des Gegners
            // Erzeuge einen blauen Laser
            lasers.push(
              new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "blue")
            );
          } else {
            //* Schaden anwenden
            enemy.health -= tower.tower_damage_lvl;
            // Erzeuge einen roten Laser
            lasers.push(
              new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "red")
            );
          }
        }
      }
    });

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

  if (live <= 0) {
    showGameOverModal();
    return; // Stop the game loop
  }

  setTimeout(() => {
    gameLoop();
  }, 20);
}

function updateWaveTimer() {
  waveTimer--;
  lbl_WaveTimer.innerHTML = `${wave + 1}. Welle in ${waveTimer}s`;
  if (waveTimer <= 0) {
    waveTimer = 25; // Reset the timer for the next wave
    spawnEnemy();
    wave++;
    enemy_max_velocity += 0.2;
    if (wave >= 10) {
      enemy_max_health += 20;
    } else {
      max_enemy_amount += wave;
      enemy_max_health += 15;
    }
    money += wave;
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
      tower = place;

      if (!place.tower_is_build) {
        mdl_towers.style.display = "flex";
      } else {
        // Update the tower stats in the upgrade modal
        towerTypeElement.innerHTML = `Typ: ${tower.tower_type}`;
        towerDamageLvlElement.innerHTML = `Schaden: Stufe ${tower.tower_damage_lvl} / 3`;
        towerRangeElement.innerHTML = `Reichweite: ${tower.range} / 140`;
        mdl_upgrade.style.display = "flex";
      }
    }
  });
});

btn_Slower.addEventListener("click", () => {
  const tower_price = btn_Slower.getAttribute("data-tower_price");
  const tower_img = btn_Slower.getAttribute("data-tower_img");
  if (money >= tower_price) {
    tower.tower_type = "slower";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    tower.tower_damage_lvl = 0;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    money -= tower_price;
    mdl_towers.style.display = "none";
  }
});

btn_Destroyer.addEventListener("click", () => {
  const tower_price = btn_Destroyer.getAttribute("data-tower_price");
  const tower_img = btn_Destroyer.getAttribute("data-tower_img");
  if (money >= tower_price) {
    tower.tower_type = "destroyer";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    money -= tower_price;
    mdl_towers.style.display = "none";
  }
});

//* Upgrades
const btn_bigger_range = document.getElementById("btn_bigger_range");
const towerTypeElement = document.getElementById("tower_type");
const towerDamageLvlElement = document.getElementById("tower_damage_lvl");
const towerRangeElement = document.getElementById("tower_range");
const btn_Stronger = document.getElementById("btn_Stronger");
const btn_SellTower = document.getElementById("btn_SellTower");

btn_bigger_range.addEventListener("click", () => {
  const upgrade_price = parseInt(btn_bigger_range.getAttribute("data-upgrade_price"));
  if (money >= upgrade_price && tower.range < 140) { // Begrenze die Reichweite auf 140 (80 + 3 * 20)
    tower.range += 20;
    money -= upgrade_price;
    towerRangeElement.innerHTML = `Reichweite: ${tower.range}`;
    mdl_upgrade.style.display = "none";
  } else if (tower.range >= 140) {
    alert("Maximale Reichweite erreicht!");
  } else {
    alert("Nicht genug Geld für das Upgrade!");
  }
});

btn_Stronger.addEventListener("click", () => {
  const upgrade_price = parseInt(btn_Stronger.getAttribute("data-tower_price"));
  if (money >= upgrade_price && tower.tower_damage_lvl < 3) { // Begrenze den Schaden auf Stufe 3
    tower.tower_damage_lvl += 1;
    money -= upgrade_price;
    towerDamageLvlElement.innerHTML = `Schaden: Stufe ${tower.tower_damage_lvl}`;
    mdl_upgrade.style.display = "none";
  } else if (tower.tower_damage_lvl >= 3) {
    alert("Maximale Schadensstufe erreicht!");
  } else {
    alert("Nicht genug Geld für das Upgrade!");
  }
});

btn_SellTower.addEventListener("click", () => {
  if (tower && tower.tower_is_build) {
    const sell_price = 30; // 50% des Kaufpreises zurückgeben
    money += sell_price;
    tower.tower_is_build = false;
    tower.tower_type = "";
    tower.tower_img = "";
    tower.tower_damage_lvl = 1;
    tower.range = 80;
    mdl_upgrade.style.display = "none";
  } else {
    alert("Kein Turm zum Verkaufen ausgewählt!");
  }
});

// Close the modal when the user clicks on <span> (x)
closeModal.onclick = function () {
  gameOverModal.style.display = "none";
};

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function (event) {
  if (event.target == gameOverModal) {
    gameOverModal.style.display = "none";
  }
};

// Start the game loop
gameLoop();

// Update the wave timer every second
setInterval(updateWaveTimer, 1000);

btn_close_modal_towers.addEventListener("click", () => {
  mdl_towers.style.display = "none";
});

btn_close_modal_upgrade.addEventListener("click", () => {
  mdl_upgrade.style.display = "none";
});
