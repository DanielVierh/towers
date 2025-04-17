import { Creep } from "./classes/Creep.js";
import { Laser } from "./classes/Laser.js";

import { drawWaypoints, random_level } from './functions/level.js';



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
const btn_mute = document.getElementById("btn_mute");
const menu_modal = document.getElementById("menu_modal");
const btn_start_game = document.getElementById("btn_start_game");
const btn_goto_menu = document.getElementById("btn_goto_menu");
const btn_pause = document.getElementById("btn_pause");
const lbl_energy = document.getElementById("lbl_energy");
const tower_img = document.getElementById("tower_img");
const game_audio = document.getElementById("game_audio");
const sel_difficulty = document.getElementById("sel_difficulty");
const btn_save_game = document.getElementById('btn_save_game');
const btn_load_game = document.getElementById('btn_load_game');
const towerImages = new Map();
const low_energy_symbol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="yellow" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
  <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
</svg>`;
const btn_show_instructions = document.getElementById('btn_show_instructions');

canvas.width = 400;
canvas.height = 400;

const enemies = [];
const lasers = [];
const moneyPopups = [];
const backgroundImage = new Image();
backgroundImage.src = "src/assets/bg/bg2.webp";
let waveTimer = 10; // Timer für die nächste Welle in Sekunden
let tower = undefined;
let show_tower_range = false;
let game_is_running = false;
let sound_is_on = false;

let save_obj = {
  money: 200,
  live: 20,
  enemy_max_health: 200,
  max_enemy_amount: 3,
  wave: 0,
  enemy_max_velocity: 1.5,
  energy_level: 0,
  energy_start_level: 0,
  tower_places: [
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
      x: 150,
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
    {
      x: 300,
      y: 245,
      tower_is_build: false,
      tower_damage_lvl: 1,
      tower_type: "",
      tower_img: "",
      range: 80,
      cooldown: 0,
    },
    {
      x: 195,
      y: 245,
      tower_is_build: false,
      tower_damage_lvl: 1,
      tower_type: "",
      tower_img: "",
      range: 80,
      cooldown: 0,
    },
    {
      x: 360,
      y: 60,
      tower_is_build: false,
      tower_damage_lvl: 1,
      tower_type: "",
      tower_img: "",
      range: 80,
      cooldown: 0,
    },
    {
      x: 210,
      y: 95,
      tower_is_build: false,
      tower_damage_lvl: 1,
      tower_type: "",
      tower_img: "",
      range: 80,
      cooldown: 0,
    },
  ],
  level: 1,
  waypoints: [],

}

function initializeTowerImages() {
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_is_build && tower.tower_img) {
      if (!towerImages.has(tower.tower_img)) {
        const img = new Image();
        img.src = tower.tower_img;
        towerImages.set(tower.tower_img, img);
      }
    }
  });
}

function saveGameToLocalStorage() {
  localStorage.setItem("towers_savegame", JSON.stringify(save_obj));
}

function loadGameFromLocalStorage() {
  const savedGame = localStorage.getItem("towers_savegame");
  if (savedGame) {
    save_obj = JSON.parse(savedGame);
    initializeTowerImages(); // Bilder der Türme nach dem Laden initialisieren
  }
}

btn_show_instructions.addEventListener('click', ()=> {
  window.location = 'instructions.html'
})


//*#########################################################
//* ANCHOR -spawnEnemy
//*#########################################################
//* Creep 1: Air creep
//* Creep 2: Anti Toxic Creep
//* Creep 3: Fast Creeps
//* Creep 4: Raupen -- not able to slow down and toxi
//* Creep 5: Boss - not able to slow down

const creep_properties = [
  {
    name: 'Air',
    src: 'src/assets/creeps/creep_1',
    extra_velocity: -.4,
    extra_health: 800,
    scale: 0.1,
    resistent: ['slower', 'toxic'],
    extra_money_amount: 3
  },
  {
    name: 'Ground, normal',
    src: 'src/assets/creeps/creep_2',
    extra_velocity: -0.3,
    extra_health: 50,
    scale: 0.2,
    resistent: ['toxic', 'anti_air'],
    extra_money_amount: 1
  },
  {
    name: 'Ground, fast',
    src: 'src/assets/creeps/creep_3',
    extra_velocity: 1,
    extra_health: -80,
    scale: 0,
    resistent: ['anti_air'],
    extra_money_amount: 5
  },
  {
    name: 'Ground, slow',
    src: 'src/assets/creeps/creep_4',
    extra_velocity: -0.7,
    extra_health: 50,
    scale: 0,
    resistent: ['toxic', 'slower', 'anti_air'],
    extra_money_amount: 0
  },
  {
    name: 'Ground, boss',
    src: 'src/assets/creeps/creep_5',
    extra_velocity: -0.7,
    extra_health: 350,
    scale: 0.1,
    resistent: ['slower', 'anti_air'],
    extra_money_amount: 8
  }
];



function spawnEnemy() {
  let enemyCount = 0;
  const random_creep = Math.floor(Math.random() * creep_properties.length);
  // const random_creep = 0;
  const spawnInterval = setInterval(() => {
    if (enemyCount >= save_obj.max_enemy_amount) {
      clearInterval(spawnInterval);
      return;
    }
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 50;
    const scale = (1 + creep_properties[random_creep].scale);
    const health =Math.floor(Math.random() * (save_obj.enemy_max_health - save_obj.enemy_max_health / 2 + 1)) + save_obj.enemy_max_health / 2 + creep_properties[random_creep].extra_health;
    const velocity = Math.random() * (save_obj.enemy_max_velocity - 1) + 1 + creep_properties[random_creep].extra_velocity;
    const imgFolder = creep_properties[random_creep].src;
    const resistent = creep_properties[random_creep].resistent
    const extra_money = creep_properties[random_creep].extra_money_amount;
    
    enemies.push(
      new Creep(
        posX,
        posY,
        width,
        height,
        imgFolder,
        scale,
        save_obj.waypoints,
        health,
        velocity,
        resistent,
        extra_money
      )
    );
    enemyCount++;
  }, 500);
}



//*#########################################################
//* ANCHOR -getTowerColor
//*#########################################################

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

//*#########################################################
//* ANCHOR -getRangeColor
//*#########################################################

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

//*#########################################################
//* ANCHOR -drawTowerPlaces
//*#########################################################

function drawTowerPlaces() {
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_is_build) {
      const towerImage = towerImages.get(tower.tower_img);
      if (towerImage) {
        ctx.drawImage(towerImage, tower.x, tower.y - 10, 40, 55);
      }
      //* Zeichne einen farbigen Rahmen um den Turm basierend auf der Upgrade-Stufe
      ctx.strokeStyle = getTowerColor(tower);
      ctx.lineWidth = 3;
      ctx.strokeRect(tower.x + 18, tower.y + 33, 10, 3);

      if(save_obj.energy_level < 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(tower.x + 5, tower.y, 30, 30);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(low_energy_symbol, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          ctx.drawImage(img, tower.x + 5, tower.y + 5, 20, 20);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }

      //* Zeichne farbigen Rahmen für Turm Range
      //* Zeichne einen farbigen Rahmen um den Turm basierend auf der Upgrade-Stufe
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
        } else if(tower.tower_type === 'anti_air') {
          ctx.strokeStyle = "grey"; // Grau für Anti Air
        }else {
          ctx.strokeStyle = "transparent"; // Standardfarbe
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

//*#########################################################
//* ANCHOR -Collision detection
//*#########################################################
function checkCollision(colliding_object_A, colliding_object_B) {
  return (
    colliding_object_A.pos_x < colliding_object_B.pos_x + colliding_object_B.width &&
    colliding_object_A.pos_x + colliding_object_A.width > colliding_object_B.pos_x &&
    colliding_object_A.pos_y < colliding_object_B.pos_y + colliding_object_B.height &&
    colliding_object_A.pos_y + colliding_object_A.height > colliding_object_B.pos_y
  );
}


//*#########################################################
//* ANCHOR -calculate Distance
//*#########################################################

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

//*#########################################################
//* ANCHOR -show Game Over Modal
//*#########################################################

function showGameOverModal() {
  gameOverModal.style.display = "block";
  lbl_Live.innerHTML = "0 Leben";
}

//*#########################################################
//* ANCHOR -GAMELOOP
//*#########################################################
function gameLoop() {
  if (game_is_running === false) {
    return;
  }
  
  count_energy_level();
  let low_energy_load_slowing_effect = 0;
  if(save_obj.energy_level < 0) {
    low_energy_load_slowing_effect = 50;
    lbl_energy.style.color = 'black'
    lbl_energy.style.background = 'red'
  }else {
     lbl_energy.style.color = 'white'
     lbl_energy.style.background = 'black'
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //* Hintergrundbild zeichnen
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  //* Zuerst die Waypoints zeichnen
  drawWaypoints(ctx, save_obj.waypoints);

  //* Tower Places zeichnen
  drawTowerPlaces();

  lbl_Money.innerHTML = `${save_obj.money}€`;
  lbl_Live.innerHTML = `${save_obj.live} Leben`;
  lbl_wave.innerHTML = `Welle: ${save_obj.wave}`;
  lbl_energy.innerHTML = `Überschüssige Energie ${save_obj.energy_level}`

  //* Dann die Creeps darüber zeichnen
  enemies.forEach((enemy, index) => {
    enemy.update(save_obj, moneyPopups);

    //* Markiere den Creeps zur Löschung, wenn er die Grenze überschreitet
    if (enemy.pos_x > 400) {
      enemy.markedForDeletion = true;
      save_obj.live--;
    
      document.body.classList.add("red-flash");
      setTimeout(() => {
        document.body.classList.remove("red-flash");
      }, 300);
    }

    //* Überprüfen, ob der Creeps in der Nähe eines Turms ist
    save_obj.tower_places.forEach((tower) => {
      if (tower.tower_is_build && tower.cooldown <= 0) {
        const distance = calculateDistance(
          enemy.pos_x,
          enemy.pos_y,
          tower.x,
          tower.y
        );

        if (distance < tower.range) {
          //* Radius von 80 Pixeln

          if (enemy.health <= 0) {
            enemy.markedForDeletion = true;

            let earnedMoney = 0;
            if (save_obj.wave > 20) {
              earnedMoney = 2;
            } else if (save_obj.wave >= 4) {
              earnedMoney = 4;
            } else {
              earnedMoney = 10;
            }

            earnedMoney = earnedMoney += enemy.extra_money;
          
            save_obj.money += earnedMoney;
          
            // Füge ein Popup an der aktuellen Position des Gegners hinzu
            moneyPopups.push({
              x: enemy.pos_x,
              y: enemy.pos_y,
              amount: `+${earnedMoney}`,
              opacity: 1, // Start-Deckkraft
            });
          }

          //* Verlangsamen des Gegners, wenn er von einem Slower-Turm getroffen wird
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

            //* Verlangsamen des Gegners, wenn nicht resistent            
            if(!enemy.resistent.includes('slower')) {
              enemy.applySlowEffect(slow_val, slow_time); 
              //* Erzeuge einen blauen Laser
              lasers.push(
                new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "blue")
              );
            }
            
            tower.cooldown = 20; // Setze die Abklingzeit auf 20 Frames
           
            //* Toxic Tower
          } else if (tower.tower_type === "toxic") {
            if(save_obj.energy_level >= 0) {
              let toxic_power = 0.2;
              if (tower.tower_damage_lvl === 1) {
                toxic_power = 0.2;
              } else if (tower.tower_damage_lvl === 2) {
                toxic_power = 0.5;
              } else if (tower.tower_damage_lvl === 3) {
                toxic_power = 1;
              }

              //* Toxicade Enemy if not resistent
              if(!enemy.resistent.includes('toxic')) {
                enemy.is_toxicated = true;

                //* Green Laser 
                  lasers.push(
                    new Laser(
                      tower.x + 15,
                      tower.y,
                      enemy.pos_x,
                      enemy.pos_y,
                      "green"
                    )
                  );
              }
              tower.cooldown = 20; //* Setze die Abklingzeit auf 20 Frames
            }
          
            //* Destroyer Tower
          } else if(tower.tower_type === "destroyer") {
            //* Harm Enemy
            if(!enemy.resistent.includes('destroyer')) {
              enemy.health -= tower.tower_damage_lvl;
              // *Erzeuge einen roten Laser
              lasers.push(
                new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "red")
              );
            }
            //* Cool Down
            tower.cooldown = (1 + (tower.tower_damage_lvl * 4) + low_energy_load_slowing_effect); 

            //* Anti Air Tower
          }else if(tower.tower_type === "anti_air") {
            //* Harm Enemy
            if(!enemy.resistent.includes('anti_air')) {
                enemy.health -= (tower.tower_damage_lvl * 70);
                // *Erzeuge Missle 
                lasers.push(
                  new Laser(tower.x + 15, tower.y, enemy.pos_x, enemy.pos_y, "missle")
                );
            }
            //* Cool Down
            tower.cooldown = 50; 
            
          }
        }
      }

      //* Reduziere die Abklingzeit des Turms
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

  // Zeichne die Popups
  drawMoneyPopups();

  //* Update und zeichne die Laser
  lasers.forEach((laser, index) => {
    laser.update();
    laser.draw(ctx);

    //* Entferne den Laser, wenn er das Ziel erreicht hat
    if (laser.posX === laser.targetX && laser.posY === laser.targetY) {
      lasers.splice(index, 1);
    }
  });

  if (save_obj.live <= 0) {
    showGameOverModal();
    btn_goto_menu.classList.remove('hidden');
    btn_pause.classList.add('hidden');
    btn_save_game.classList.add('hidden');
    lbl_Live.style.color = 'tomato'
    return; // Stop the game loop
  }

  setTimeout(() => {
    gameLoop();
  }, 20);
}

//*#########################################################
//* ANCHOR -drawMoneyPopups
//*#########################################################
function drawMoneyPopups() {
  moneyPopups.forEach((popup, index) => {
    // Zeichne den Text
    ctx.font = "18px Arial";
    ctx.fillStyle = `rgba(0, 0, 0, ${popup.opacity})`; // Gelber Text mit Transparenz
    ctx.fillText(popup.amount, popup.x, popup.y);

    // Aktualisiere die Position und Deckkraft
    popup.y -= 1; // Bewege das Popup nach oben
    popup.opacity -= 0.02; // Verringere die Deckkraft

    // Entferne das Popup, wenn es unsichtbar ist
    if (popup.opacity <= 0) {
      moneyPopups.splice(index, 1);
    }
  });
}

//*#########################################################
//* ANCHOR -update Wave Timer
//*#########################################################

function updateWaveTimer() {
  if (save_obj.live <= 0) {
    return;
  }

  if (game_is_running === false) {
    return;
  }

  waveTimer--;
  lbl_WaveTimer.innerHTML = `${save_obj.wave + 1}. Welle in ${waveTimer}s`;
  if (waveTimer <= 0) {
    let time_to_next_wave = 30;
    if (save_obj.wave >= 6) {
      time_to_next_wave = 45;
    }
    waveTimer = time_to_next_wave; // Reset the timer for the next wave
    spawnEnemy();
    save_obj.wave++;
    save_obj.wave < 10
      ? (save_obj.enemy_max_velocity += 0.1)
      : (save_obj.enemy_max_velocity = save_obj.enemy_max_velocity);
    if (save_obj.wave >= 7) {
      save_obj.enemy_max_health += 20;
    } else {
      save_obj.max_enemy_amount += save_obj.wave;
      save_obj.enemy_max_health += 15;
    }
    save_obj.money += Math.floor(save_obj.wave * 2);
  }
}

//*#########################################################
//* ANCHOR -Open Modal for Tower Place
//*#########################################################
// 
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  save_obj.tower_places.forEach((place) => {
    if (
      x >= place.x &&
      x <= place.x + 30 &&
      y >= place.y &&
      y <= place.y + 30
    ) {
      tower = place;
      if(!game_is_running) {
        game_is_running = true;
      }
      play_pause();
      if (!place.tower_is_build) {
        //*Open Modal for Baumenu and show current Money and Energy
        mdl_towers.style.display = "flex";
        const lbl_current_money = document.getElementById('lbl_current_money');
        const lbl_current_energy = document.getElementById('lbl_current_energy');
        lbl_current_money.innerHTML = `${save_obj.money} €`;
        lbl_current_energy.innerHTML = `${save_obj.energy_level}`;
      } else {
        //* ANCHOR - Open Modal for Upgrade the tower 
        tower_img.src = tower.tower_img
        towerTypeElement.innerHTML = `Typ: ${tower.tower_type}`;
        towerDamageLvlElement.innerHTML = `Stärke: Stufe ${tower.tower_damage_lvl} / 3`;
        towerRangeElement.innerHTML = `Reichweite: ${tower.range} / 140`;
        mdl_upgrade.style.display = "flex";
        if (tower.tower_damage_lvl === 2) {
          btn_Stronger.innerHTML = "Kaufen 500€";
          btn_Stronger.setAttribute("data-tower_price", "500");
        } else if (tower.tower_damage_lvl === 3) {
          btn_Stronger.innerHTML = "Max. Upgrade";
        } else {
          btn_Stronger.innerHTML = "Kaufen 300€";
          btn_Stronger.setAttribute("data-tower_price", "300");
        }
        //* Display "Max Range" on the purchase button or show the price
        if(tower.range === 140) {
          btn_bigger_range.innerHTML = 'Max. Reichweite';
        }else {
          btn_bigger_range.innerHTML = 'Kaufen 300€';
        }
        //* Hide Range on energy tower
        if(tower.tower_type === 'energy') {
          btn_Stronger.innerHTML = 'Kaufen 300€';
          btn_Stronger.setAttribute("data-tower_price", "300");
          btn_bigger_range.style.display = 'none';
          document.getElementById('tile_upgrade_range').style.display = 'none';
          document.getElementById('tower_stats').style.display = 'none';
          document.getElementById('tile_upgrade_stronger_title').innerHTML = 'Mehr Brennstäbe';
          document.getElementById('tile_upgrade_stronger_descr').innerHTML = 'Erzeugt mehr Energie <br> +50 ' + low_energy_symbol;
          if(tower.tower_damage_lvl === 3) {
            btn_Stronger.innerHTML = 'Max. Upgrade';
          }
        }else {
          btn_Stronger.style.display = 'flex';
          btn_bigger_range.style.display = 'flex';
          document.getElementById('tile_upgrade_range').style.display = 'flex';
          document.getElementById('tower_stats').style.display = 'flex';
          document.getElementById('tile_upgrade_stronger_title').innerHTML = 'Stärke Upgrade';
          document.getElementById('tile_upgrade_stronger_descr').innerHTML = 'Erhöht die Stärke des Turms <br> 25 '  + low_energy_symbol;
        }
      }
    }
  });
});

//*#########################################################
//* ANCHOR -Set Tower Slower
//*#########################################################

btn_Slower.addEventListener("click", () => {
  const tower_price = btn_Slower.getAttribute("data-tower_price");
  const tower_img = btn_Slower.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = "slower";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    tower.tower_damage_lvl = 0;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
  }
});

//*#########################################################
//* ANCHOR -Set Tower Destroyer
//*#########################################################

btn_Destroyer.addEventListener("click", () => {
  const tower_price = btn_Destroyer.getAttribute("data-tower_price");
  const tower_img = btn_Destroyer.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = "destroyer";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
  }
});

//*#########################################################
//* ANCHOR -Set Tower Toxic
//*#########################################################

btn_Toxic.addEventListener("click", () => {
  const tower_price = btn_Toxic.getAttribute("data-tower_price");
  const tower_img = btn_Toxic.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = "toxic";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld');
  }
});

//*#########################################################
//* ANCHOR -Set Anti Air Tower
//*#########################################################

const btn_Anti_Air = document.getElementById('btn_Anti_Air');

btn_Anti_Air.addEventListener("click", () => {
  const tower_price = btn_Anti_Air.getAttribute("data-tower_price");
  const tower_img = btn_Anti_Air.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = "anti_air";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld');
  }
});

//*#########################################################
//* ANCHOR -Set Tower Energy
//*#########################################################

btn_energy.addEventListener("click", () => {
  const tower_price = btn_energy.getAttribute("data-tower_price");
  const tower_img = btn_energy.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = "energy";
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    mdl_towers.style.display = "none";
    if(game_is_running === false) {
      play_pause();
    }
  }else {
    alert('Nicht genug Geld')
  }
});

//*#########################################################
//* ANCHOR -Upgrade Tower Range
//*#########################################################

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
  if (save_obj.money >= upgrade_price && tower.range < 140) {
    // Begrenze die Reichweite auf 140 (80 + 3 * 20)
    tower.range += 20;
    save_obj.money -= upgrade_price;
    towerRangeElement.innerHTML = `Reichweite: ${tower.range}`;
    mdl_upgrade.style.display = "none";
    play_pause();
  } else if (tower.range >= 140) {
    alert("Maximale Reichweite erreicht!");
  } else {
    alert("Nicht genug Geld für das Upgrade!");
  }
});


//*#########################################################
//* ANCHOR -Upgrade Stronger Tower
//*#########################################################
btn_Stronger.addEventListener("click", () => {
  const upgrade_price = parseInt(btn_Stronger.getAttribute("data-tower_price"));
  if (save_obj.money >= upgrade_price && tower.tower_damage_lvl < 3) {
    // Begrenze den Schaden auf Stufe 3
    tower.tower_damage_lvl += 1;
    save_obj.money -= upgrade_price;
    towerDamageLvlElement.innerHTML = `Schaden: Stufe ${tower.tower_damage_lvl}`;
    mdl_upgrade.style.display = "none";
    play_pause();
  } else if (tower.tower_damage_lvl >= 3) {
    alert("Maximale Upgrade Stufe erreicht!");
  } else {
    alert("Nicht genug Geld für das Upgrade!");
  }
});

//*#########################################################
//* ANCHOR -Sell Tower
//*#########################################################
btn_SellTower.addEventListener("click", () => {
  const confirm = window.confirm('Soll der Turm wirklich verkauft werden?');
  if(confirm) {
    if (tower && tower.tower_is_build) {
      const sell_price = 30; // 50% des Kaufpreises zurückgeben
      save_obj.money += sell_price;
      tower.tower_is_build = false;
      tower.tower_type = "";
      tower.tower_img = "";
      tower.tower_damage_lvl = 1;
      tower.range = 80;
      mdl_upgrade.style.display = "none";
      play_pause();
    } else {
      alert("Kein Turm zum Verkaufen ausgewählt!");
    }
  }
});

//*#########################################################
//* ANCHOR - Close the modal when the user clicks on <span> (x)
//*#########################################################

closeModal.onclick = ()=> {
  gameOverModal.style.display = "none";
};

//*#########################################################
//* ANCHOR - Close the modal when the user clicks anywhere outside of the modal
//*#########################################################
// 
window.onclick = (event)=> {
  if (event.target == gameOverModal) {
    gameOverModal.style.display = "none";
  }
};

//*#########################################################
//* ANCHOR -close modal towers
//*#########################################################
btn_close_modal_towers.addEventListener("click", () => {
  mdl_towers.style.display = "none";
  play_pause();
});

//*#########################################################
//* ANCHOR -close modal upgrade
//*#########################################################
btn_close_modal_upgrade.addEventListener("click", () => {
  mdl_upgrade.style.display = "none";
  play_pause();
});

//*#########################################################
//* ANCHOR -show tower range
//*#########################################################

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

//*#########################################################
//* ANCHOR -btn_save_game
//*#########################################################
btn_save_game.addEventListener('click', ()=> {
  saveGameToLocalStorage();
  alert('Spiel wurde gespeichert');
})

//*#########################################################
//* ANCHOR -btn_load_game
//*#########################################################
btn_load_game.addEventListener('click', ()=> {
  loadGameFromLocalStorage();
  menu_modal.classList.remove("active");
  backgroundImage.src = save_obj.backgroundImage;
  game_is_running = true;
  if(sound_is_on) {
    game_audio.play();
  }
  // Start the game loop
  gameLoop();

  // Update the wave timer every second
  setInterval(updateWaveTimer, 1000);
})

//*#########################################################
//* ANCHOR -start Game
//*#########################################################

btn_start_game.addEventListener("click", () => {
  const level = random_level();
  save_obj.backgroundImage = level.background_img_path;
  backgroundImage.src = level.background_img_path;
  save_obj.waypoints = level.waypoints;
  save_obj.tower_places = level.tower_places;
  start_game();
});


function start_game() {
  menu_modal.classList.remove("active");
  const game_difficulty = sel_difficulty.value;

  set_difficulty(game_difficulty);
  
  game_is_running = true;
  if(sound_is_on) {
    game_audio.play();
  }
  // Start the game loop
  gameLoop();

  // Update the wave timer every second
  setInterval(updateWaveTimer, 1000);
}

//*#########################################################
//* ANCHOR -set Game difficulty
//*#########################################################
function set_difficulty(game_difficulty) {
  if(game_difficulty === 'very_easy') {
    save_obj.live = 30;
    save_obj.money = 1000;
    save_obj.enemy_max_health = 150;
    save_obj.energy_start_level = 100;
  }
  if(game_difficulty === 'easy') {
    save_obj.live = 25;
    save_obj.money = 250;
    save_obj.enemy_max_health = 170;
    save_obj.energy_start_level = 50;
  }
  if(game_difficulty === 'standard') {
    save_obj.live = 20;
    save_obj.money = 200;
    save_obj.enemy_max_health = 200;
    save_obj.energy_start_level = 0;
  }
  if(game_difficulty === 'hard') {
    save_obj.live = 15;
    save_obj.money = 200;
    save_obj.enemy_max_health = 250;
    save_obj.energy_start_level = -25;
  }
}

//*#########################################################
//* ANCHOR -Reload Page
//*#########################################################

btn_goto_menu.addEventListener('click', ()=> {
  window.location.reload();
})

//*#########################################################
//* ANCHOR -Pause and continue
//*#########################################################

btn_pause.addEventListener('click', () => {
  play_pause();
});

//*#########################################################
//* ANCHOR -play pause
//*#########################################################
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
    if(sound_is_on) {
      game_audio.play();
    }
    

    // Starte die gameLoop erneut
    gameLoop();
  }
}

//*#########################################################
//* ANCHOR -count_energy_level 
//*#########################################################

function count_energy_level() {
  const energy_tower_amount = tower_type_amount(save_obj.tower_places, 'energy');
  save_obj.energy_level = (energy_tower_amount * 100) + save_obj.energy_start_level;

  //* Add energy for each upgrade level of energy towers
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === 'energy') {
      save_obj.energy_level += (tower.tower_damage_lvl * 50) - 50; // +50 energy per upgrade level
    }
  });

  //* Every Destroyer Tower needs 25 Energy Points, reduced by 25 per upgrade level
  const destroyer_energy = 25;
  const destroyer_amount = tower_type_amount(save_obj.tower_places, 'destroyer');
  let destroyer_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === 'destroyer') {
      destroyer_energy_amount += Math.max(0, destroyer_energy + (tower.tower_damage_lvl * 25) - 25);
    }
  });

  //* Every anti_air Tower needs 25 Energy Points, reduced by 25 per upgrade level
  const anti_air_energy = 25;
  const anti_air_amount = tower_type_amount(save_obj.tower_places, 'anti_air');
  let anti_air_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === 'anti_air') {
      anti_air_energy_amount += Math.max(0, anti_air_energy + (tower.tower_damage_lvl * 25) - 25);
    }
  });

  //* Every Toxic Tower needs 75 Energy Points, reduced by 25 per upgrade level
  const toxic_energy = 75;
  const toxic_amount = tower_type_amount(save_obj.tower_places, 'toxic');
  let toxic_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === 'toxic') {
      toxic_energy_amount += Math.max(0, toxic_energy + (tower.tower_damage_lvl * 25) -25);
    }
  });

  //* Every Slower Tower needs 75 Energy Points, reduced by 25 per upgrade level
  const slower_energy = 75;
  const slower_amount = tower_type_amount(save_obj.tower_places, 'slower');
  let slower_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === 'slower') {
      slower_energy_amount += Math.max(0, slower_energy + (tower.tower_damage_lvl * 25));
    }
  });

  save_obj.energy_level = save_obj.energy_level - destroyer_energy_amount - toxic_energy_amount - slower_energy_amount - anti_air_energy_amount;
}

//*#########################################################
//* ANCHOR -tower_type_amount
//*#########################################################

function tower_type_amount(towers, towertype) {
  let amount = 0;
  towers.forEach((tower) => {
    if(tower.tower_type === towertype) {
      amount++;
    }
  });
  return amount;
}

//*#########################################################
//* ANCHOR -Toggle sound
//*#########################################################

btn_mute.addEventListener('click', ()=> {
  if(sound_is_on) {
    game_audio.pause();
    sound_is_on = false;
    btn_mute.style.background = 'red';
  }else {
    game_audio.play();
    sound_is_on = true;
    btn_mute.style.background = 'black';
  }
})