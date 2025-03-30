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
const btn_close_modal_towers = document.getElementById("btn_close_modal_towers");
const btn_Slower = document.getElementById("btn_Slower");
const btn_Destroyer = document.getElementById("btn_Destroyer");
const btn_Toxic = document.getElementById("btn_Toxic");
const btn_energy = document.getElementById("btn_energy");
const btn_close_modal_upgrade = document.getElementById("btn_close_modal_upgrade");
const mdl_upgrade = document.getElementById("mdl_upgrade");
const btn_show_tower_range = document.getElementById("btn_show_tower_range");
const menu_modal = document.getElementById("menu_modal");
const btn_start_game = document.getElementById("btn_start_game");
const btn_goto_menu = document.getElementById("btn_goto_menu");
const btn_pause = document.getElementById("btn_pause");
const lbl_energy = document.getElementById("lbl_energy");
const game_audio = document.getElementById("game_audio");
const towerImages = new Map();

canvas.width = 400;
canvas.height = 400;

const waypoints = [
  { x: -50, y: 20 },
  { x: 50, y: 20 },
  { x: 340, y: 20 },
  { x: 340, y: 110 },
  { x: 30, y: 110 },
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
    y: 15,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 295,
    y: 15,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 160,
    y: 95,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 90,
    y: 165,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 250,
    y: 245,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 130,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 350,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 300,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 180,
    y: 330,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 280,
    y: 165,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
  {
    x: 90,
    y: 245,
    tower_is_build: false,
    tower_damage_lvl: 1,
    tower_type: "",
    tower_img: "",
    range: 80,
    cooldown: 0,
  },
];

const enemies = [];
const lasers = [];
const backgroundImage = new Image();
backgroundImage.src = "src/assets/bg/bg2.webp";
let live = 20;
let waveTimer = 10; // Timer für die nächste Welle in Sekunden
let money = 200;
let max_enemy_amount = 3;
let wave = 0;
let enemy_max_health = 200;
let enemy_max_velocity = 1.5;
let tower = undefined;
let show_tower_range = false;
let game_is_running = false;
let energy_level = 0;

function spawnEnemy() {
  let enemyCount = 0;
  const spawnInterval = setInterval(() => {
    if (enemyCount >= max_enemy_amount) {
      clearInterval(spawnInterval);
      return;
    }
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
    enemyCount++;
  }, 500);
}

function drawWaypoints() {
  ctx.strokeStyle = "rgba(241, 207, 113, 0.9)";
  ctx.lineWidth = 20;
  ctx.beginPath();
  waypoints.forEach((waypoint, index) => {
    const adjustedY = waypoint.y + 40; // Verschiebe die y-Koordinate um 50 Pixel nach unten
    if (index === 0) {
      ctx.moveTo(waypoint.x, adjustedY);
    } else {
      ctx.lineTo(waypoint.x, adjustedY);
    }
    ctx.arc(waypoint.x, adjustedY, 2, 0, Math.PI * 2);
  });
  ctx.stroke();
}

function getTowerColor(tower) {
  switch (tower.tower_damage_lvl) {
    case 1:
      return "rgba(255, 255, 255, 0.2)"; // Weiß für Stufe 1
    case 2:
      return "rgb(255, 217, 0)"; // Grün für Stufe 2
    case 3:
      return "rgba(255, 0, 0, 0.6)"; // Rot für Stufe 3
    default:
      return "rgba(255, 255, 255, 0.2)"; // Schwarz für Stufe 0
  }
}

function getRangeColor(tower) {
  switch (tower.range) {
    case 80:
      return "rgba(255, 255, 255, 0.2)"; // Weiß für Stufe 1
    case 100:
      return "rgb(0, 255, 55)"; // Grün für Stufe 2
    case 120:
      return "rgb(255, 217, 0)"; // Rot für Stufe 3
    case 140:
      return "rgba(255, 0, 0, 0.6)"; // Rot für Stufe 4
    default:
      return "rgba(255, 255, 255, 0.2)"; // Schwarz für Stufe 0
  }
}

function drawTowerPlaces() {
  tower_places.forEach((tower) => {
    if (tower.tower_is_build) {
      const towerImage = towerImages.get(tower.tower_img);
      if (towerImage) {
        ctx.drawImage(towerImage, tower.x, tower.y - 10, 40, 55);
      }
      // Zeichne einen farbigen Rahmen um den Turm basierend auf der Upgrade-Stufe
      ctx.strokeStyle = getTowerColor(tower);
      ctx.lineWidth = 3;
      ctx.strokeRect(tower.x + 18, tower.y + 33, 10, 3);

      //Zeichne farbigen Rahmen für Turm Range
      // Zeichne einen farbigen Rahmen um den Turm basierend auf der Upgrade-Stufe
      ctx.strokeStyle = getRangeColor(tower);
      ctx.lineWidth = 3;
      ctx.strokeRect(tower.x + 3, tower.y + 33, 10, 3);

      if (show_tower_range) {

        ctx.beginPath();
        ctx.arc(tower.x + 15, tower.y + 15, tower.range, 0, Math.PI * 2);
        if (tower.tower_type === "toxic") {
          ctx.strokeStyle = "green"; // Grüner Kreis für toxic tower
        } else if (tower.tower_type === "destroyer") {
          ctx.strokeStyle = "red"; // Roter Kreis für destroyer tower
        } else if (tower.tower_type === "slower") {
          ctx.strokeStyle = "blue"; // Blauer Kreis für slower tower
        } else {
          ctx.strokeStyle = "rgb(255, 0, 0)"; // Standardfarbe
        }
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
      }
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(tower.x, tower.y, 30, 30);
    }
  });
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function showGameOverModal() {
  gameOverModal.style.display = "block";
  lbl_Live.innerHTML = "0 Leben";
}

function gameLoop() {
  if (game_is_running === false) {
    return;
  }

  count_energy_level();
  let low_energy_load_slowing_effect = 0;
  if(energy_level < 0) {
    console.log('unter 0');
    low_energy_load_slowing_effect = 30;
    lbl_energy.style.color = 'red'
  }else {
     lbl_energy.style.color = 'white'
  }

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
  lbl_energy.innerHTML = `Energie ${energy_level}`

  // Dann die Orcs darüber zeichnen
  enemies.forEach((enemy, index) => {
    enemy.update();

    // Markiere den Orc zur Löschung, wenn er die Grenze überschreitet
    if (enemy.pos_x > 400) {
      enemy.markedForDeletion = true;
      live--;
    
      document.body.classList.add("red-flash");
      setTimeout(() => {
        document.body.classList.remove("red-flash");
      }, 300);
    }

    // Überprüfen, ob der Orc in der Nähe eines Turms ist
    tower_places.forEach((tower) => {
      if (tower.tower_is_build && tower.cooldown <= 0) {
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

            if (wave > 20) {
              money += 2;
            } else if (wave >= 4) {
              money += 4;
            } else {
              money += 10;
            }
          }

          // Verlangsamen des Gegners, wenn er von einem Slower-Turm getroffen wird
         //* Slower Tower
          if (tower.tower_type === "slower") {
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
            tower.cooldown = 20; // Setze die Abklingzeit auf 20 Frames
           //* Toxic Tower
          } else if (tower.tower_type === "toxic") {
            let toxic_power = 0.2;
            if (tower.tower_damage_lvl === 1) {
              toxic_power = 0.2;
            } else if (tower.tower_damage_lvl === 2) {
              toxic_power = 0.5;
            } else if (tower.tower_damage_lvl === 3) {
              toxic_power = 1;
            }
            enemy.is_toxicated = true;
            lasers.push(
              new Laser(
                tower.x + 15,
                tower.y,
                enemy.pos_x,
                enemy.pos_y,
                "green"
              )
            );
            tower.cooldown = 20; // Setze die Abklingzeit auf 20 Frames
          
            //* Destroyer Tower
          } else if(tower.tower_type === "destroyer") {
            enemy.health -= tower.tower_damage_lvl;
            // Erzeuge einen roten Laser
            lasers.push(
              new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "red")
            );
            
            tower.cooldown = (1 + (tower.tower_damage_lvl * 4) + low_energy_load_slowing_effect); 
          }
        }
      }

      // Reduziere die Abklingzeit des Turms
      if (tower.cooldown > 0) {
        tower.cooldown--;
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
    btn_goto_menu.classList.remove('hidden');
    btn_pause.classList.add('hidden')
    return; // Stop the game loop
  }

  setTimeout(() => {
    gameLoop();
  }, 20);
}

function updateWaveTimer() {
  if (live <= 0) {
    return;
  }

  if (game_is_running === false) {
    return;
  }

  waveTimer--;
  lbl_WaveTimer.innerHTML = `${wave + 1}. Welle in ${waveTimer}s`;
  if (waveTimer <= 0) {
    let time_to_next_wave = 30;
    if (wave >= 6) {
      time_to_next_wave = 40;
    }
    waveTimer = time_to_next_wave; // Reset the timer for the next wave
    spawnEnemy();
    wave++;
    wave < 10
      ? (enemy_max_velocity += 0.1)
      : (enemy_max_velocity = enemy_max_velocity);
    if (wave >= 10) {
      enemy_max_health += 20;
    } else {
      max_enemy_amount += wave;
      enemy_max_health += 15;
    }
    money += Math.floor(wave * 2);
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
        towerDamageLvlElement.innerHTML = `Stärke: Stufe ${tower.tower_damage_lvl} / 3`;
        towerRangeElement.innerHTML = `Reichweite: ${tower.range} / 140`;
        mdl_upgrade.style.display = "flex";
        if (tower.tower_damage_lvl === 2) {
          btn_Stronger.innerHTML = "Kaufen 500€";
          btn_Stronger.setAttribute("data-tower_price", "500");
        } else if (tower.tower_damage_lvl === 3) {
          btn_Stronger.innerHTML = "Max Upgrade";
        } else {
          btn_Stronger.innerHTML = "Kaufen 300€";
          btn_Stronger.setAttribute("data-tower_price", "300");
        }
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
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
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
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
  }
});

btn_Toxic.addEventListener("click", () => {
  const tower_price = btn_Toxic.getAttribute("data-tower_price");
  const tower_img = btn_Toxic.getAttribute("data-tower_img");
  if (money >= tower_price) {
    tower.tower_type = "toxic";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld');
  }
});

btn_energy.addEventListener("click", () => {
  const tower_price = btn_energy.getAttribute("data-tower_price");
  const tower_img = btn_energy.getAttribute("data-tower_img");
  if (money >= tower_price) {
    tower.tower_type = "energy";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
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
  const upgrade_price = parseInt(
    btn_bigger_range.getAttribute("data-upgrade_price")
  );
  if (money >= upgrade_price && tower.range < 140) {
    // Begrenze die Reichweite auf 140 (80 + 3 * 20)
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
  if (money >= upgrade_price && tower.tower_damage_lvl < 3) {
    // Begrenze den Schaden auf Stufe 3
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

btn_close_modal_towers.addEventListener("click", () => {
  mdl_towers.style.display = "none";
});

btn_close_modal_upgrade.addEventListener("click", () => {
  mdl_upgrade.style.display = "none";
});

let rangeTimer;

btn_show_tower_range.addEventListener("click", () => {
  show_tower_range = true;

  // Überprüfe, ob ein Timer bereits läuft, und lösche ihn
  if (rangeTimer) {
    clearTimeout(rangeTimer);
  }

  // Starte einen neuen Timer
  rangeTimer = setTimeout(() => {
    show_tower_range = false;
  }, 10000);
});

//* start Game
btn_start_game.addEventListener("click", () => {
  menu_modal.classList.remove("active");
  game_is_running = true;
  game_audio.play();
  // Start the game loop
  gameLoop();

  // Update the wave timer every second
  setInterval(updateWaveTimer, 1000);
});

//* Reload Page
btn_goto_menu.addEventListener('click', ()=> {
  window.location.reload();
})

//* Pause and continue
btn_pause.addEventListener('click', () => {
  play_pause();
});

function play_pause() {
  if (game_is_running) {
    // Spiel pausieren
    game_is_running = false;
    btn_pause.innerHTML = 'Weiter';
    game_audio.pause();
  } else {
    // Spiel fortsetzen
    game_is_running = true;
    btn_pause.innerHTML = 'Pause';
    game_audio.play();
    console.log(game_audio);
    

    // Starte die gameLoop erneut
    gameLoop();
  }
}

function count_energy_level() {
  const energy_tower_amount = tower_type_amount(tower_places, 'energy');
  energy_level = (energy_tower_amount * 100);

  //* Every Destroyer Tower needs 25 Energy Points
  const destroyer_energy = 25;
  const destroyer_amount = tower_type_amount(tower_places, 'destroyer');
  const destroyer_energy_amount = destroyer_energy * destroyer_amount;
  //* Every Toxic Tower needs 75 Energy Points
  const toxic_energy = 75;
  const toxic_amount = tower_type_amount(tower_places, 'toxic');
  const toxic_energy_amount = toxic_energy * toxic_amount;
  //* Every Slower Tower needs 75 Energy Points
  const slower_energy = 75;
  const slower_amount = tower_type_amount(tower_places, 'slower');
  const slower_energy_amount = slower_energy * slower_amount;

  energy_level = energy_level - destroyer_energy_amount - toxic_energy_amount - slower_energy_amount;

}

function tower_type_amount(towers, towertype) {
  let amount = 0;
  towers.forEach((tower) => {
    if(tower.tower_type === towertype) {
      amount++;
    }
  });
  return amount;
}