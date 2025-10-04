import { Creep } from "./classes/Creep.js";
import { Laser } from "./classes/Laser.js";
import { GameMessage } from "./classes/GameMessage.js";

import { drawWaypoints, set_level } from "./functions/level.js";
import {
  render_amount,
  render_XP_Coins,
  return_Item_Amount_and_existence,
} from "./functions/xp_Items.js";
import { getRandomMinMax } from "./functions/helper_functions.js";

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
const btn_Toxic = document.getElementById("btn_Toxic");
const btn_energy = document.getElementById("btn_energy");
const btn_close_modal_upgrade = document.getElementById(
  "btn_close_modal_upgrade"
);
const mdl_upgrade = document.getElementById("mdl_upgrade");
const btn_show_tower_range = document.getElementById("btn_show_tower_range");
const menu_modal = document.getElementById("menu_modal");
const btn_start_game = document.getElementById("btn_start_game");
const btn_goto_menu = document.getElementById("btn_goto_menu");
const btn_pause = document.getElementById("btn_pause");
const lbl_energy = document.getElementById("lbl_energy");
const tower_img = document.getElementById("tower_img");
const sel_difficulty = document.getElementById("sel_difficulty");
const btn_save_game = document.getElementById("btn_save_game");
const btn_load_game = document.getElementById("btn_load_game");
const mdl_traps = document.getElementById("mdl_traps");
const towerImages = new Map();
const low_energy_symbol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="yellow" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
  <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
</svg>`;
const btn_show_instructions = document.getElementById("btn_show_instructions");
const btn_mine = document.getElementById("btn_mine");
const lbl_XP = document.getElementById("lbl_XP");
const modal_select_lvl = document.getElementById("modal_select_lvl");
const level_0 = document.getElementById("level_0");
const level_1 = document.getElementById("level_1");
const level_2 = document.getElementById("level_2");
const level_3 = document.getElementById("level_3");
const level_4 = document.getElementById("level_4");
const level_5 = document.getElementById("level_5");
const level_random = document.getElementById("level_random");
const btn_close_modal_lvl = document.getElementById("btn_close_modal_lvl");
const lbl_xp = document.getElementById("lbl_xp");
const lbl_title = document.getElementById("lbl_title");
const btn_open_skill_menu = document.getElementById("btn_open_skill_menu");
const mdl_skill_tree = document.getElementById("mdl_skill_tree");
const btn_close_modal_skill = document.getElementById("btn_close_modal_skill");
const btn_trap_discount = document.getElementById("btn_trap_discount");
const btn_tower_discount = document.getElementById("btn_tower_discount");
const check_trap_discount = document.getElementById("check_trap_discount");
const check_tower_discount = document.getElementById("check_tower_discount");
const btn_life_upgrade = document.getElementById("btn_life_upgrade");
const tile_upgrade_liveGenerator = document.getElementById(
  "tile_upgrade_liveGenerator"
);
const btn_livegen = document.getElementById("btn_livegen");

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
let waypoint_color = "rgba(241, 207, 113, 0.9)";
let energy_animation_counter = 0;

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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
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
      live_gen: 0,
      kill_counter: 0,
    },
  ],
  level: 1,
  waypoints: [],
  waypoint_color: "",
  current_XP: 0,
  assign_XP: false,
  XP: 0,
  XP_Coins: 0,
  XP_Store_Items: [
    {
      name: "trap_rabatt_50",
      amount: 0,
    },
  ],
  save_date: new Date().toISOString(), // Deklariert das aktuelle Datum und die Uhrzeit
  active_game_target_wave: 0,
};

//*#########################################################
//* ANCHOR - Initialize Images for Tower
//*#########################################################
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

//*#########################################################
//* ANCHOR - Save Game into local storage
//*#########################################################
function saveGameToLocalStorage() {
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, "0")}.${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.${now.getFullYear()} - ${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} (${
    save_obj.wave
  }/${save_obj.active_game_target_wave})`;
  save_obj.save_date = formattedDate;
  localStorage.setItem("towers_savegame", JSON.stringify(save_obj));
}

function save_Game_without_saveDate() {
  localStorage.setItem("towers_savegame", JSON.stringify(save_obj));
}

//* ANCHOR - Open Skill Modal
btn_open_skill_menu.addEventListener("click", () => {
  mdl_skill_tree.classList.add("active");
});

btn_close_modal_skill.addEventListener("click", () => {
  mdl_skill_tree.classList.remove("active");
});

//*#########################################################
//* ANCHOR - Load Game  from Local Storage
//*#########################################################
function loadGameFromLocalStorage() {
  const savedGame = localStorage.getItem("towers_savegame");
  if (savedGame) {
    save_obj = JSON.parse(savedGame);
    console.log("saveGame", save_obj);

    lbl_xp.innerHTML = `${save_obj.XP.toLocaleString(
      "de-DE"
    )} XP <br> ${save_obj.XP_Coins.toLocaleString("de-DE")} XP Coins`;
    include_new_SaveObj_Properties();
    if (save_obj.save_date !== undefined) {
      btn_load_game.style.flexDirection = "column";
      btn_load_game.innerHTML = `Spiel Laden <p style="font-size: .7rem;" >${save_obj.save_date}</p>`;
    } else {
      btn_load_game.style.display = "none";
    }
    try {
      render_amount(save_obj);
      render_XP_Coins(save_obj);
    } catch (error) {
      console.log(error);
    }
    initializeTowerImages();
  } else {
    btn_load_game.style.display = "none";
  }
}

//*#########################################################
//* ANCHOR - Include new properties into existing save obj
//*#########################################################
function include_new_SaveObj_Properties() {
  //* Add XP Coins
  if (save_obj.XP_Coins === undefined) {
    try {
      save_obj.XP_Coins = save_obj.XP;
    } catch (error) {
      console.log(error);
      save_obj.XP = 0;
      save_obj.XP_Coins = save_obj.XP;
    }
    saveGameToLocalStorage();
  }

  //* Add XP_Store_Items
  if (save_obj.XP_Store_Items === undefined) {
    try {
      save_obj.XP_Store_Items = [
        {
          name: "trap_rabatt_50",
          amount: 0,
        },
      ];
    } catch (error) {
      console.log(error);
    }
    saveGameToLocalStorage();
  }
}

//*#########################################################
//* ANCHOR - Go to Instruction Page
//*#########################################################

btn_show_instructions.addEventListener("click", () => {
  window.location = "instructions.html";
});

//*#########################################################
//* ANCHOR - Init .-load
//*#########################################################

window.onload = () => {
  loadGameFromLocalStorage();
  // const greeting = new GameMessage(
  //   "Willkommen zurück",
  //   "Du erhälst heute 500 XP-Coins",
  //   "success",
  //   7000
  // ).show_Message();
};

//*#########################################################
//* ANCHOR -spawnEnemy
//*#########################################################
//* Creep 1: Air creep
//* Creep 2: Anti Toxic Creep
//* Creep 3: Fast Creeps
//* Creep 4: Raupen -- not able to slow down and toxi
//* Creep 5: Boss - not able to slow down
//* Creep 6: Air - boss

const creep_properties = [
  {
    name: "Air, normal",
    src: "src/assets/creeps/creep_1",
    extra_velocity: -0.4,
    extra_health: 800,
    scale: 0.1,
    resistent: ["slower", "toxic", "mine"],
    extra_money_amount: 3,
  },
  {
    name: "Air, boss",
    src: "src/assets/creeps/creep_6",
    extra_velocity: 0,
    extra_health: 1150,
    scale: 0.1,
    resistent: ["slower", "toxic", "mine"],
    extra_money_amount: 8,
  },
  {
    name: "Ground, normal",
    src: "src/assets/creeps/creep_2",
    extra_velocity: -0.3,
    extra_health: 50,
    scale: 0.2,
    resistent: ["anti_air", "air_mine"],
    extra_money_amount: 1,
  },
  {
    name: "Ground, fast",
    src: "src/assets/creeps/creep_3",
    extra_velocity: 1,
    extra_health: -80,
    scale: 0,
    resistent: ["anti_air", "air_mine"],
    extra_money_amount: 5,
  },
  {
    name: "Ground, slow",
    src: "src/assets/creeps/creep_4",
    extra_velocity: -0.7,
    extra_health: 50,
    scale: 0,
    resistent: ["toxic", "slower", "anti_air", "air_mine"],
    extra_money_amount: 0,
  },
  {
    name: "Ground, boss",
    src: "src/assets/creeps/creep_5",
    extra_velocity: -0.7,
    extra_health: 350,
    scale: 0.1,
    resistent: ["slower", "anti_air", "air_mine"],
    extra_money_amount: 8,
  },
];

//* Creep 0: Boss Super Tanky - not able to slow down, mine and toxi resistent
//* Creep 1: Invisible - not able to slow down - can only be seen by anti air tower
const special_creeps = [
  {
    name: "Special, Super-Tanky",
    src: "src/assets/creeps/creep_5",
    velocity: 0.5,
    extra_health: 3500,
    scale: 0.6,
    resistent: ["slower", "anti_air", "air_mine", "toxic", "slower", "mine"],
    extra_money_amount: 50,
  },
  {
    name: "Ground, invisible",
    src: "src/assets/creeps/creep_7",
    velocity: 1,
    extra_health: 300,
    scale: 0.1,
    resistent: ["slower", "air_mine", "anti_air", "toxic", "destroyer"],
    extra_money_amount: 20,
    invisible: true,
  },
];

function call_special_creep() {
  if (save_obj.wave % 6 === 0) {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 50;
    const scale = 1 + special_creeps[0].scale;
    const health = save_obj.enemy_max_health + special_creeps[0].extra_health;
    const velocity = special_creeps[0].velocity;
    const imgFolder = special_creeps[0].src;
    const resistent = special_creeps[0].resistent;
    const extra_money = special_creeps[0].extra_money_amount;
    const invisible = false;
    const amount = 1;
    add_special_creep(
      posX,
      posY,
      width,
      height,
      imgFolder,
      scale,
      health,
      velocity,
      resistent,
      extra_money,
      invisible,
      amount
    );
  }

  if (save_obj.wave % 10 === 0) {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 50;
    const scale = 1 + special_creeps[1].scale;
    const health = save_obj.enemy_max_health + special_creeps[1].extra_health;
    const velocity = special_creeps[1].velocity;
    const imgFolder = special_creeps[1].src;
    const resistent = special_creeps[1].resistent;
    const extra_money = special_creeps[1].extra_money_amount;
    const invisible = special_creeps[1].invisible;
    const amount = 10;
    add_special_creep(
      posX,
      posY,
      width,
      height,
      imgFolder,
      scale,
      health,
      velocity,
      resistent,
      extra_money,
      invisible,
      amount
    );
  }
}

function add_special_creep(
  posX,
  posY,
  width,
  height,
  imgFolder,
  scale,
  health,
  velocity,
  resistent,
  extra_money,
  invisible,
  amount
) {
  for (let i = 1; i <= amount; i++) {
    setTimeout(() => {
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
          extra_money,
          invisible
        )
      );
    }, i * 1200);
  }
}

//*#########################################################
//* ANCHOR - Initialize Creeps for this and next round
//*########################################################
let current_creep_index = undefined;
let next_round_creep_index = 2;

function initialize_Creeps_for_next_round() {
  //* If first round
  if (current_creep_index === undefined) {
    current_creep_index = next_round_creep_index;
    next_round_creep_index =
      save_obj.wave < 10
        ? Math.floor(Math.random() * (creep_properties.length - 2)) + 2
        : Math.floor(Math.random() * creep_properties.length);
    spawnEnemy();
  } else {
    current_creep_index = next_round_creep_index;
    next_round_creep_index =
      save_obj.wave < 10
        ? Math.floor(Math.random() * (creep_properties.length - 2)) + 2
        : Math.floor(Math.random() * creep_properties.length);
    call_special_creep();
    spawnEnemy();
  }
}

function spawnEnemy() {
  let enemyCount = 0;
  const creep_index = current_creep_index;
  // const creep_index = 0;
  const spawnInterval = setInterval(() => {
    if (enemyCount >= save_obj.max_enemy_amount) {
      clearInterval(spawnInterval);
      return;
    }
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 50;
    const scale = 1 + creep_properties[creep_index].scale;
    const health =
      Math.floor(
        Math.random() *
          (save_obj.enemy_max_health - save_obj.enemy_max_health / 2 + 1)
      ) +
      save_obj.enemy_max_health / 2 +
      creep_properties[creep_index].extra_health;
    const velocity =
      Math.random() * (save_obj.enemy_max_velocity - 1) +
      1 +
      creep_properties[creep_index].extra_velocity;
    const imgFolder = creep_properties[creep_index].src;
    const resistent = creep_properties[creep_index].resistent;
    const extra_money = creep_properties[creep_index].extra_money_amount;

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

      if (save_obj.energy_level < 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(tower.x + 5, tower.y, 30, 30);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(
          low_energy_symbol,
          "image/svg+xml"
        );
        const svgElement = svgDoc.documentElement;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
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
        } else if (tower.tower_type === "anti_air") {
          ctx.strokeStyle = "grey"; // Grau für Anti Air
        } else if (tower.tower_type === "mine") {
          ctx.strokeStyle = "black"; // Grau für Anti Air
        } else if (tower.tower_type === "air_mine") {
          ctx.strokeStyle = "black"; // Grau für Anti Air
        } else {
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

    //* Energy Building Animation
    if (tower.tower_type === "energy") {
      const reset_point = 5;
      energy_animation_counter++;
      if (energy_animation_counter === reset_point) {
        const x_random_pos = getRandomMinMax(8, 20);
        ctx.fillStyle = "rgba(13, 138, 227, 1)";
        ctx.fillRect(tower.x + x_random_pos, tower.y, 15, 15);
        energy_animation_counter = 0;
      }
    }
  });
}

//*#########################################################
//* ANCHOR -Collision detection
//*#########################################################
function checkCollision(colliding_object_A, colliding_object_B) {
  return (
    colliding_object_A.pos_x <
      colliding_object_B.pos_x + colliding_object_B.width &&
    colliding_object_A.pos_x + colliding_object_A.width >
      colliding_object_B.pos_x &&
    colliding_object_A.pos_y <
      colliding_object_B.pos_y + colliding_object_B.height &&
    colliding_object_A.pos_y + colliding_object_A.height >
      colliding_object_B.pos_y
  );
}

//*#########################################################
//* ANCHOR -calculate Distance
//*#########################################################

function calculateDistance(
  x1,
  y1,
  x2,
  y2,
  width1 = 0,
  height1 = 0,
  width2 = 0,
  height2 = 0
) {
  const centerX1 = x1 + width1 / 2;
  const centerY1 = y1 + height1 / 2;
  const centerX2 = x2 + width2 / 2;
  const centerY2 = y2 + height2 / 2;
  return Math.sqrt((centerX2 - centerX1) ** 2 + (centerY2 - centerY1) ** 2);
}

//*#########################################################
//* ANCHOR -show Game Over Modal
//*#########################################################

function showGameOverModal() {
  gameOverModal.style.display = "block";
  lbl_Live.innerHTML = "0 Leben";
  //* Assign new XP and XP-Coins
  if (!save_obj.assign_XP) {
    save_obj.XP += Math.floor(save_obj.current_XP / 2);
    const game_difficulty = sel_difficulty.value;
    let base_XP_Coins = 500;
    let lostLive = 30 - save_obj.live;
    if (game_difficulty === "easy") {
      base_XP_Coins = 1500;
      lostLive = 25 - save_obj.live;
    } else if (game_difficulty === "standard") {
      base_XP_Coins = 2000;
      lostLive = 20 - save_obj.live;
    } else if (game_difficulty === "hard") {
      base_XP_Coins = 3000;
      lostLive = 15 - save_obj.live;
    }
    const live_Loss_Antibonus = lostLive * 20;
    const new_XP_Coins = Math.floor(
      (base_XP_Coins + save_obj.current_XP - live_Loss_Antibonus) / 1.5
    );

    save_obj.XP_Coins += new_XP_Coins;
    if (save_obj.current_XP > 0) {
      lbl_XP.innerHTML = ` +${Math.floor(
        save_obj.current_XP.toLocaleString("de-DE") / 2
      )} XP (${save_obj.XP.toLocaleString(
        "de-DE"
      )} XP) <br> ${new_XP_Coins} XP-Coins`;
    }
    save_obj.assign_XP = true;
    saveGameToLocalStorage();
  }
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
  if (save_obj.energy_level < 0) {
    low_energy_load_slowing_effect = 50;
    lbl_energy.style.color = "black";
    lbl_energy.style.background = "red";
  } else {
    lbl_energy.style.color = "white";
    lbl_energy.style.background = "black";
  }

  //* DEBUG - Log Set Towers
  // save_obj.tower_places.forEach((tower, index) => {
  //   if (tower.tower_is_build) {
  //     console.log(`Tower ${index + 1}:`, tower);
  //   }
  // });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //* Hintergrundbild zeichnen
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  //* Zuerst die Waypoints zeichnen
  drawWaypoints(ctx, save_obj.waypoints, waypoint_color);

  //* Tower Places zeichnen
  drawTowerPlaces();

  lbl_Money.innerHTML = `${save_obj.money}€`;
  lbl_Live.innerHTML = `${save_obj.live} Leben`;
  if (current_creep_index !== undefined) {
    lbl_wave.innerHTML = `Welle: ${save_obj.wave} / ${save_obj.active_game_target_wave} - ${creep_properties[current_creep_index].name}`;
    if (save_obj.wave === save_obj.active_game_target_wave) {
      lbl_wave.innerHTML = `Letzte Welle: ${save_obj.wave}`;
    }
  }
  lbl_energy.innerHTML = `Überschüssige Energie ${save_obj.energy_level}`;

  //* Update game labels
  updateLabels();

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
          tower.y,
          enemy.width,
          enemy.height,
          30,
          30 // 30x30 ist die Towergröße
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
            save_obj.current_XP += 1;

            save_obj.money += earnedMoney;

            //* Live Gen
            if (tower.live_gen === 1) {
              tower.kill_counter += 1;
              console.log("Tower Upgrade kill"), tower.kill_counter;

              if (tower.kill_counter === 20) {
                save_obj.live++;
                tower.kill_counter = 0;
                console.log("LIVE ++");
              }
            }

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
            if (!enemy.resistent.includes("slower")) {
              enemy.applySlowEffect(slow_val, slow_time);
              //* Erzeuge einen blauen Laser
              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "blue"
                )
              );
            }

            tower.cooldown = 20; // Setze die Abklingzeit auf 20 Frames

            //* Toxic Tower
          } else if (tower.tower_type === "toxic") {
            let toxic_power = 0.1;
            if (save_obj.energy_level >= 0) {
              if (tower.tower_damage_lvl === 1) {
                toxic_power = 0.1;
              } else if (tower.tower_damage_lvl === 2) {
                toxic_power = 0.2;
              } else if (tower.tower_damage_lvl === 3) {
                toxic_power = 0.5;
              }

              //* Toxicade Enemy if not resistent
              if (!enemy.resistent.includes("toxic")) {
                enemy.is_toxicated = true;
                enemy.toxicated_lvl = toxic_power;

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
          } else if (tower.tower_type === "destroyer") {
            //* Harm Enemy
            if (!enemy.resistent.includes("destroyer")) {
              enemy.health -= tower.tower_damage_lvl;
              // *Erzeuge einen roten Laser
              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "red"
                )
              );
            }
            //* Cool Down
            tower.cooldown =
              1 + tower.tower_damage_lvl * 4 + low_energy_load_slowing_effect;

            //* >>> Anti Air Tower <<<
          } else if (tower.tower_type === "anti_air") {
            //* Discover invisible Enemy
            if (enemy.invisible) {
              enemy.invisible = false;
              enemy.resistent = ["slower", "anti_air", "air_mine"];
            }
            //* Harm Enemy
            if (!enemy.resistent.includes("anti_air")) {
              enemy.health -= tower.tower_damage_lvl * 70;
              // *Erzeuge Missle
              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "missle"
                )
              );
            }
            //* Cool Down
            tower.cooldown = 50;

            //* >>> Mine <<<
          } else if (tower.tower_type === "mine") {
            if (!enemy.resistent.includes("mine")) {
              setTimeout(() => {
                setTimeout(() => {
                  enemy.health = 0;
                  enemy.markedForDeletion = true;
                }, 100);
                setTimeout(() => {
                  // Explosion-Animation anzeigen
                  triggerExplosion(tower.x + 20, tower.y);
                  // Mine entfernen
                  tower.tower_is_build = false;
                  tower.tower_type = "";
                  tower.tower_img = "";
                }, 50);
              }, 10);
            }
          } else if (tower.tower_type === "air_mine") {
            if (!enemy.resistent.includes("air_mine")) {
              setTimeout(() => {
                enemy.health = 0;
                enemy.markedForDeletion = true;
                setTimeout(() => {
                  // Explosion-Animation anzeigen
                  triggerExplosion(tower.x + 20, tower.y);
                  // Mine entfernen
                  tower.tower_is_build = false;
                  tower.tower_type = "";
                  tower.tower_img = "";
                }, 50);
              }, 10);
            }
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
    btn_goto_menu.classList.remove("hidden");
    btn_pause.classList.add("hidden");
    btn_save_game.classList.add("hidden");
    lbl_Live.style.color = "tomato";
    return; // Stop the game loop
  }

  // Explosionen zeichnen
  activeExplosions.forEach((explosion, index) => {
    if (explosion.frame < explosionFrames.length) {
      // Zeichne das aktuelle Frame der Explosion
      ctx.drawImage(
        explosionFrames[explosion.frame],
        explosion.x - 40,
        explosion.y - 40,
        80,
        80
      );
      explosion.frame++; // Nächstes Frame
    } else {
      // Entferne die Explosion, wenn alle Frames gezeichnet wurden
      activeExplosions.splice(index, 1);
    }
  });

  setTimeout(() => {
    gameLoop();
  }, 20);
}

const activeExplosions = [];
const explosionFrames = [];

function preloadExplosionImages() {
  for (let i = 1; i <= 10; i++) {
    const img = new Image();
    img.src = `src/assets/mine/Explosion_${i}.png`;
    explosionFrames.push(img);
  }
}

function triggerExplosion(x, y) {
  activeExplosions.push({
    x: x,
    y: y,
    frame: 0, // Start bei Frame 0
  });
}

// Rufe diese Funktion beim Start des Spiels auf
preloadExplosionImages();

//*#########################################################
//* ANCHOR - Update Labels
//*#########################################################

function updateLabels() {
  lbl_Money.innerHTML = `${save_obj.money}€`;
  lbl_Live.innerHTML = `${save_obj.live} Leben`;
  lbl_energy.innerHTML = `Überschüssige Energie ${save_obj.energy_level}`;
  if (current_creep_index !== undefined) {
    lbl_wave.innerHTML = `Welle: ${save_obj.wave} / ${save_obj.active_game_target_wave} - ${creep_properties[current_creep_index].name}`;
    if (save_obj.wave === save_obj.active_game_target_wave) {
      lbl_wave.innerHTML = `Letzte Welle: ${save_obj.wave}`;
    }
  }
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
  lbl_WaveTimer.innerHTML = `${save_obj.wave + 1}. Welle in ${waveTimer}s - ${
    creep_properties[next_round_creep_index].name
  }`;
  if (save_obj.wave === save_obj.active_game_target_wave) {
    lbl_WaveTimer.innerHTML = `Ende in ${waveTimer}s`;
  }
  if (waveTimer <= 0) {
    let time_to_next_wave = 30;
    if (save_obj.wave >= 6) {
      time_to_next_wave = 45;
    }
    waveTimer = time_to_next_wave; // Reset the timer for the next wave
    initialize_Creeps_for_next_round();
    save_obj.wave++;

    //* Sieg
    if (save_obj.wave >= save_obj.active_game_target_wave + 1) {
      setTimeout(() => {
        won_game();
      }, 1000);
      return;
    }

    if (save_obj.money >= 1500) {
      save_obj.enemy_max_health += 250;
    }
    save_obj.wave < 10
      ? (save_obj.enemy_max_velocity += 0.1)
      : (save_obj.enemy_max_velocity = save_obj.enemy_max_velocity);
    if (save_obj.wave >= 10) {
      save_obj.enemy_max_health += 25;
    } else {
      save_obj.max_enemy_amount += save_obj.wave;
      save_obj.enemy_max_health += 20;
    }
    save_obj.money += Math.floor(save_obj.wave * 2);
    console.log(save_obj);
  }
}

//* Won Game
function won_game() {
  game_is_running = false;
  if (save_obj.assign_XP === false) {
    // Zeige das Game Over Modal mit Sieg-Text und XP-Anzeige
    gameOverModal.style.display = "block";
    gameOverModal.style.backgroundColor = "rgba(8, 178, 59, 0.8)";
    lbl_title.innerHTML = "Du hast gewonnen!";
    if (!save_obj.assign_XP) {
      save_obj.current_XP = Math.floor(
        save_obj.current_XP + save_obj.wave * 30
      );
      save_obj.XP += save_obj.current_XP;

      const game_difficulty = sel_difficulty.value;
      let base_XP_Coins = 500;
      let lostLive = 30 - save_obj.live;
      if (game_difficulty === "easy") {
        base_XP_Coins = 1500;
        lostLive = 25 - save_obj.live;
      } else if (game_difficulty === "standard") {
        base_XP_Coins = 2000;
        lostLive = 20 - save_obj.live;
      } else if (game_difficulty === "hard") {
        base_XP_Coins = 3000;
        lostLive = 15 - save_obj.live;
      }
      const live_Loss_Antibonus = lostLive * 20;
      const new_XP_Coins = Math.floor(
        base_XP_Coins + save_obj.current_XP - live_Loss_Antibonus
      );

      save_obj.XP_Coins += new_XP_Coins;
      if (save_obj.current_XP > 0) {
        lbl_XP.innerHTML = ` +${save_obj.current_XP.toLocaleString(
          "de-DE"
        )} XP (${save_obj.XP.toLocaleString(
          "de-DE"
        )} XP) <br> ${new_XP_Coins} XP-Coins`;
      }
      save_obj.current_XP = 0;
      save_obj.assign_XP = true;
      save_obj.save_date = undefined;
      save_Game_without_saveDate();
    }
    btn_goto_menu.classList.remove("hidden");
    btn_pause.classList.add("hidden");
    btn_save_game.classList.add("hidden");
  }
}

//*#########################################################
//* ANCHOR -Open Modal for Tower Place
//*#########################################################
//
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect(); // Aktuelle Größe des Canvas
  const scaleX = canvas.width / rect.width; // Skalierungsfaktor für die Breite
  const scaleY = canvas.height / rect.height; // Skalierungsfaktor für die Höhe

  // Mauskoordinaten relativ zur Canvas-Größe berechnen
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  save_obj.tower_places.forEach((place) => {
    if (
      x >= place.x &&
      x <= place.x + 30 &&
      y >= place.y &&
      y <= place.y + 30
    ) {
      tower = place;
      if (!game_is_running) {
        game_is_running = true;
      }
      play_pause();

      //* Modal for traps
      if (place.is_trap) {
        mdl_traps.style.display = "flex";
        show_trap_price();
        set_class_for_overpriced_towers();
        return;
      }
      if (!place.tower_is_build) {
        //*Open Modal for Baumenu and show current Money and Energy
        mdl_towers.style.display = "flex";
        const lbl_current_money = document.getElementById("lbl_current_money");
        const lbl_current_energy =
          document.getElementById("lbl_current_energy");
        lbl_current_money.innerHTML = `${save_obj.money} €`;
        lbl_current_energy.innerHTML = `${save_obj.energy_level}`;
        show_recuded_price_on_discount();
        calc_energy_overdose();
        set_class_for_overpriced_towers();
      } else {
        //* ANCHOR - Open Modal for Upgrade the tower
        const lbl_upgr_current_money = document.getElementById(
          "lbl_upgr_current_money"
        );
        const lbl_upgr_current_energy = document.getElementById(
          "lbl_upgr_current_energy"
        );
        //* Show Upgrade for live gen
        const upgrade_live_gen = return_Item_Amount_and_existence(
          save_obj,
          "live_generator"
        );
        console.log("upgrade_live_gen", upgrade_live_gen);

        if (upgrade_live_gen.available && tower.tower_type === "destroyer") {
          tile_upgrade_liveGenerator.classList.remove("hidden");
          if (tower.live_gen === 1) {
            document.getElementById("btn_livegen").innerHTML = "Aktiv";
          } else {
            document.getElementById("btn_livegen").innerHTML = "Kaufen 700€";
          }
        } else {
          tile_upgrade_liveGenerator.classList.add("hidden");
        }
        lbl_upgr_current_money.innerHTML = `${save_obj.money} €`;
        lbl_upgr_current_energy.innerHTML = `${save_obj.energy_level}`;
        tower_img.src = tower.tower_img;
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
        if (tower.range === 140) {
          btn_bigger_range.innerHTML = "Max. Reichweite";
        } else {
          btn_bigger_range.innerHTML = "Kaufen 300€";
        }
        //* Hide Range on energy tower
        if (tower.tower_type === "energy") {
          btn_Stronger.innerHTML = "Kaufen 300€";
          btn_Stronger.setAttribute("data-tower_price", "300");
          btn_bigger_range.style.display = "none";
          document.getElementById("tile_upgrade_range").style.display = "none";
          document.getElementById("tower_stats").style.display = "none";
          document.getElementById("tile_upgrade_stronger_title").innerHTML =
            "Mehr Brennstäbe";
          document.getElementById("tile_upgrade_stronger_descr").innerHTML =
            "Erzeugt mehr Energie <br> +50 " + low_energy_symbol;
          if (tower.tower_damage_lvl === 3) {
            btn_Stronger.innerHTML = "Max. Upgrade";
          }
        } else {
          btn_Stronger.style.display = "flex";
          btn_bigger_range.style.display = "flex";
          document.getElementById("tile_upgrade_range").style.display = "flex";
          document.getElementById("tower_stats").style.display = "flex";
          document.getElementById("tile_upgrade_stronger_title").innerHTML =
            "Stärke Upgrade";
          document.getElementById("tile_upgrade_stronger_descr").innerHTML =
            "Erhöht die Stärke des Turms <br> 25 " + low_energy_symbol;
        }
      }
    }
  });
});

//* Toggle trap discount
check_trap_discount.addEventListener("click", () => {
  show_trap_price();
  set_class_for_overpriced_towers();
});

function show_trap_price() {
  const oldPrice_mine_ground = 70;
  const new_price_mine_ground = oldPrice_mine_ground / 2;
  const oldPrice_mine_air = 70;
  const new_price_mine_air = oldPrice_mine_air / 2;
  const btn_ground_mine = document.getElementById("btn_ground_mine");
  const mine_rabatt = return_Item_Amount_and_existence(
    save_obj,
    "trap_rabatt_50"
  );
  const is_mine_discount = check_trap_discount.checked;
  const trigger_btn_air_mine = document.getElementById("trigger_btn_air_mine");
  if (mine_rabatt.available && mine_rabatt.amount > 0 && is_mine_discount) {
    btn_mine.setAttribute("data-tower_price", new_price_mine_ground);
    btn_air_mine.setAttribute("data-tower_price", new_price_mine_air);
    btn_ground_mine.innerHTML = `Kaufen ${new_price_mine_ground}€`;
    trigger_btn_air_mine.innerHTML = `Kaufen ${new_price_mine_air}€`;
  } else {
    btn_mine.setAttribute("data-tower_price", oldPrice_mine_ground);
    btn_air_mine.setAttribute("data-tower_price", oldPrice_mine_air);
    btn_ground_mine.innerHTML = `Kaufen ${oldPrice_mine_ground}€`;
    trigger_btn_air_mine.innerHTML = `Kaufen ${oldPrice_mine_air}€`;
  }
}

//* Toggle Tower Discount
check_tower_discount.addEventListener("click", () => {
  show_recuded_price_on_discount();
  calc_energy_overdose();
  set_class_for_overpriced_towers();
});

const buy_btn_powerplant = document.getElementById("buy_btn_powerplant");
const buy_btn_destroyer = document.getElementById("buy_btn_destroyer");
const buy_btn_slower = document.getElementById("buy_btn_slower");
const buy_btn_toxic = document.getElementById("buy_btn_toxic");
const buy_btn_antiair = document.getElementById("buy_btn_antiair");

function show_recuded_price_on_discount() {
  const towerDiscount = return_Item_Amount_and_existence(
    save_obj,
    "tower_rabatt_50"
  );
  const tower_discount_selected = check_tower_discount.checked;
  if (towerDiscount) {
    const original_powerplant_price = 70;
    const original_destroyer_price = 50;
    const original_slower_price = 100;
    const original_toxic_price = 300;
    const original_antiair_price = 100;

    const new_powerplant_price = 70 / 2;
    const new_destroyer_price = 50 / 2;
    const new_slower_price = 100 / 2;
    const new_toxic_price = 300 / 2;
    const new_antiair_price = 100 / 2;

    if (
      towerDiscount.available &&
      towerDiscount.amount > 0 &&
      check_tower_discount.checked & tower_discount_selected
    ) {
      buy_btn_powerplant.innerHTML = `Kaufen ${new_powerplant_price}€`;
      btn_energy.setAttribute("data-tower_price", new_powerplant_price);
      buy_btn_destroyer.innerHTML = `Kaufen ${new_destroyer_price}€`;
      btn_Destroyer.setAttribute("data-tower_price", new_destroyer_price);
      buy_btn_slower.innerHTML = `Kaufen ${new_slower_price}€`;
      btn_Slower.setAttribute("data-tower_price", new_slower_price);
      buy_btn_toxic.innerHTML = `Kaufen ${new_toxic_price}€`;
      btn_Toxic.setAttribute("data-tower_price", new_toxic_price);
      buy_btn_antiair.innerHTML = `Kaufen ${new_antiair_price}€`;
      btn_Anti_Air.setAttribute("data-tower_price", new_antiair_price);
    } else {
      buy_btn_powerplant.innerHTML = `Kaufen ${original_powerplant_price}€`;
      btn_energy.setAttribute("data-tower_price", original_powerplant_price);
      buy_btn_destroyer.innerHTML = `Kaufen ${original_destroyer_price}€`;
      btn_Destroyer.setAttribute("data-tower_price", original_destroyer_price);
      buy_btn_slower.innerHTML = `Kaufen ${original_slower_price}€`;
      btn_Slower.setAttribute("data-tower_price", original_slower_price);
      buy_btn_toxic.innerHTML = `Kaufen ${original_toxic_price}€`;
      btn_Toxic.setAttribute("data-tower_price", original_toxic_price);
      buy_btn_antiair.innerHTML = `Kaufen ${original_antiair_price}€`;
      btn_Anti_Air.setAttribute("data-tower_price", original_antiair_price);
    }
  }
}

//*#########################################################
//* ANCHOR -Set Tower Slower
//*#########################################################

btn_Slower.addEventListener("click", () => {
  set_Tower(btn_Slower, "slower", 1, mdl_towers);
});

//*#########################################################
//* ANCHOR -Set Mine
//*#########################################################

btn_mine.addEventListener("click", () => {
  set_Tower(btn_mine, "mine", 0, mdl_traps);
  const item = return_Item_Amount_and_existence(save_obj, "trap_rabatt_50");
  if (item.available && item.amount > 0) {
    const is_trap_discount = check_trap_discount.checked;
    if (is_trap_discount) {
      save_obj.XP_Store_Items[item.index].amount -= 1;
      render_amount(save_obj);
      save_Game_without_saveDate();
    }
  }
});

//*#########################################################
//* ANCHOR -Set Air Mine
//*#########################################################
const btn_air_mine = document.getElementById("btn_air_mine");

btn_air_mine.addEventListener("click", () => {
  set_Tower(btn_air_mine, "air_mine", 0, mdl_traps);
  const item = return_Item_Amount_and_existence(save_obj, "trap_rabatt_50");
  if (item.available && item.amount > 0) {
    const is_trap_discount = check_trap_discount.checked;
    if (is_trap_discount) {
      save_obj.XP_Store_Items[item.index].amount -= 1;
      render_amount(save_obj);
      save_Game_without_saveDate();
    }
  }
});

//*#########################################################
//* ANCHOR -Set Tower Destroyer
//*#########################################################

btn_Destroyer.addEventListener("click", () => {
  set_Tower(btn_Destroyer, "destroyer", 1, mdl_towers);
  substract_tower_discount();
});

//*#########################################################
//* ANCHOR -Set Tower Toxic
//*#########################################################

btn_Toxic.addEventListener("click", () => {
  set_Tower(btn_Toxic, "toxic", 1, mdl_towers);
  substract_tower_discount();
});

//*#########################################################
//* ANCHOR -Set Anti Air Tower
//*#########################################################

const btn_Anti_Air = document.getElementById("btn_Anti_Air");

btn_Anti_Air.addEventListener("click", () => {
  set_Tower(btn_Anti_Air, "anti_air", 1, mdl_towers);
  substract_tower_discount();
});

//*#########################################################
//* ANCHOR -Set Tower Energy
//*#########################################################

btn_energy.addEventListener("click", () => {
  set_Tower(btn_energy, "energy", 1, mdl_towers);
  substract_tower_discount();
});

//*#########################################################
//* ANCHOR -Substract Tower Discount on use
//*#########################################################
function substract_tower_discount() {
  const item = return_Item_Amount_and_existence(save_obj, "tower_rabatt_50");
  if (item.available && item.amount > 0) {
    const is_tower_discount = check_tower_discount.checked;
    if (is_tower_discount) {
      save_obj.XP_Store_Items[item.index].amount -= 1;
      render_amount(save_obj);
      save_Game_without_saveDate();
    }
  }
}

//*#########################################################
//* ANCHOR -Set Tower Function
//*#########################################################

function set_Tower(tower_btn, tower_type, tower_damage_lvl, closing_modal) {
  const tower_price = tower_btn.getAttribute("data-tower_price");
  const tower_img = tower_btn.getAttribute("data-tower_img");
  if (save_obj.money >= tower_price) {
    tower.tower_type = tower_type;
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    tower.tower_damage_lvl = tower_damage_lvl;
    if (!towerImages.has(tower_img)) {
      const img = new Image();
      img.src = tower_img;
      towerImages.set(tower_img, img);
    }
    save_obj.money -= tower_price;
    closing_modal.style.display = "none";
    if (game_is_running === false) {
      play_pause();
    }
  } else {
    const show_not_enough_money = new GameMessage(
      "Kauf aktuell nicht möglich",
      "Du hast nicht genug Geld",
      "error",
      2000
    ).show_Message();
  }
}

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
    const error_msg = new GameMessage(
      "Maximale Reichweite erreicht!",
      "",
      "error",
      2000
    ).show_Message();
  } else {
    const error_msg = new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000
    ).show_Message();
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
    const error_msg = new GameMessage(
      "Maximale Upgrade Stufe erreicht!",
      "",
      "error",
      2000
    ).show_Message();
  } else {
    const error_msg = new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000
    ).show_Message();
  }
});

//*#########################################################
//* ANCHOR -Upgrade Live Gen
//*#########################################################
btn_livegen.addEventListener("click", () => {
  const upgrade_price = parseInt(btn_livegen.getAttribute("data-tower_price"));
  console.log("upgrade_price", upgrade_price);

  if (save_obj.money >= upgrade_price) {
    if (tower.live_gen === 1) {
      new GameMessage(
        "Upgrade bereits aktiv!",
        "",
        "error",
        2000
      ).show_Message();
      return;
    }
    tower.live_gen = 1;
    tower.kill_counter = 0;
    save_obj.money -= upgrade_price;
    mdl_upgrade.style.display = "none";
    play_pause();
  } else {
    new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000
    ).show_Message();
  }
});

//*#########################################################
//* ANCHOR -Sell Tower
//*#########################################################
btn_SellTower.addEventListener("click", () => {
  const confirm = window.confirm("Soll der Turm wirklich verkauft werden?");
  if (confirm) {
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

closeModal.onclick = () => {
  gameOverModal.style.display = "none";
};

//*#########################################################
//* ANCHOR - Close the modal when the user clicks anywhere outside of the modal
//*#########################################################
//
window.onclick = (event) => {
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
//* ANCHOR -close modal traps
//*#########################################################
const btn_close_modal_traps = document.getElementById("btn_close_modal_traps");
btn_close_modal_traps.addEventListener("click", () => {
  mdl_traps.style.display = "none";
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
btn_save_game.addEventListener("click", () => {
  saveGameToLocalStorage();
  const show_save_success = new GameMessage(
    "Spiel gespeichert",
    "Das Spiel wurde erfolgreich gespeichert",
    "success",
    5000
  ).show_Message();
});

//*#########################################################
//* ANCHOR -btn_load_game
//*#########################################################
btn_load_game.addEventListener("click", () => {
  loadGameFromLocalStorage();
  menu_modal.classList.remove("active");
  save_obj.wave -= 1;
  backgroundImage.src = save_obj.backgroundImage;
  waypoint_color = save_obj.waypoint_color;
  game_is_running = true;
  // Start the game loop
  gameLoop();

  // Update the wave timer every second
  setInterval(updateWaveTimer, 1000);
});

//*#########################################################
//* ANCHOR -start Game
//*#########################################################

level_0.addEventListener("click", () => {
  const level_details = set_level("0");
  initialize_game(level_details);
});

level_1.addEventListener("click", () => {
  const level_details = set_level("1");
  initialize_game(level_details);
});

level_2.addEventListener("click", () => {
  const level_details = set_level("2");
  initialize_game(level_details);
});

level_3.addEventListener("click", () => {
  const level_details = set_level("3");
  initialize_game(level_details);
});

level_4.addEventListener("click", () => {
  const level_details = set_level("4");
  initialize_game(level_details);
});

level_5.addEventListener("click", () => {
  const level_details = set_level("5");
  initialize_game(level_details);
});

level_random.addEventListener("click", () => {
  const level_details = set_level("level_rnd");
  initialize_game(level_details);
});

btn_start_game.addEventListener("click", () => {
  modal_select_lvl.style.display = "flex";
});

function initialize_game(level_details) {
  save_obj.assign_XP = false;
  save_obj.current_XP = 0;
  modal_select_lvl.style.display = "none";
  const level = level_details;
  //* Set the max wave target for this round
  save_obj.active_game_target_wave = Math.floor(Math.random() * (60 - 20)) + 20;
  // save_obj.active_game_target_wave = 10; // * For testing
  //* Set the background image path in the save object
  save_obj.backgroundImage = level.background_img_path;
  //* Set the background image for the canvas
  backgroundImage.src = level.background_img_path;
  //* Set the waypoints for the level
  save_obj.waypoints = level.waypoints;
  //* Set the tower places for the level
  save_obj.tower_places = level.tower_places;
  //* Set the waypoint color for the level
  save_obj.waypoint_color = level.waypoint_color;
  //* Set the current wave to 0
  save_obj.wave = 0;
  //* Set the maximum enemy amount
  save_obj.max_enemy_amount = 2;
  //* Set the maximum enemy velocity
  save_obj.enemy_max_velocity = 1.5;
  //* Set the global waypoint color
  waypoint_color = level.waypoint_color;
  start_game();
}

function start_game() {
  menu_modal.classList.remove("active");
  const game_difficulty = sel_difficulty.value;

  set_difficulty(game_difficulty);

  game_is_running = true;

  //** Start the game loop
  gameLoop();

  // Update the wave timer every second
  setInterval(updateWaveTimer, 1000);
}

//*#########################################################
//* ANCHOR -set Game difficulty
//*#########################################################
function set_difficulty(game_difficulty) {
  if (game_difficulty === "very_easy") {
    save_obj.live = 30;
    save_obj.money = 1000;
    save_obj.enemy_max_health = 150;
    save_obj.energy_start_level = 100;
  }
  if (game_difficulty === "easy") {
    save_obj.live = 25;
    save_obj.money = 350;
    save_obj.enemy_max_health = 170;
    save_obj.energy_start_level = 50;
  }
  if (game_difficulty === "standard") {
    save_obj.live = 20;
    save_obj.money = 200;
    save_obj.enemy_max_health = 200;
    save_obj.energy_start_level = 0;
  }
  if (game_difficulty === "hard") {
    save_obj.live = 15;
    save_obj.money = 200;
    save_obj.enemy_max_health = 250;
    save_obj.energy_start_level = -25;
  }
}

//*#########################################################
//* ANCHOR -Reload Page
//*#########################################################

btn_goto_menu.addEventListener("click", () => {
  window.location.reload();
});

//*#########################################################
//* ANCHOR -Pause and continue
//*#########################################################

btn_pause.addEventListener("click", () => {
  if (game_is_running) {
    const msg_pause = new GameMessage(
      "Spiel pausiert",
      "",
      "",
      2000
    ).show_Message();
  } else {
    const msg_pause = new GameMessage(
      "Spiel fortgesetzt",
      "",
      "",
      2000
    ).show_Message();
  }
  play_pause();
});

//*#########################################################
//* ANCHOR -play pause
//*#########################################################
function play_pause() {
  if (game_is_running) {
    // Spiel pausieren
    game_is_running = false;
    btn_pause.innerHTML = "Weiter";
  } else {
    // Spiel fortsetzen
    game_is_running = true;
    btn_pause.innerHTML = "Pause";
    // Starte die gameLoop erneut
    gameLoop();
  }
}

//*#########################################################
//* ANCHOR -count_energy_level
//*#########################################################

function count_energy_level() {
  const energy_tower_amount = tower_type_amount(
    save_obj.tower_places,
    "energy"
  );
  save_obj.energy_level =
    energy_tower_amount * 100 + save_obj.energy_start_level;

  //* Add energy for each upgrade level of energy towers
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "energy") {
      save_obj.energy_level += tower.tower_damage_lvl * 50 - 50; // +50 energy per upgrade level
    }
  });

  //* Every Destroyer Tower needs 25 Energy Points, reduced by 25 per upgrade level
  const destroyer_energy = 25;
  let destroyer_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "destroyer") {
      destroyer_energy_amount += Math.max(
        0,
        destroyer_energy + tower.tower_damage_lvl * 25 - 25
      );
    }
  });

  //* Every anti_air Tower needs 25 Energy Points, reduced by 25 per upgrade level
  const anti_air_energy = 25;
  let anti_air_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "anti_air") {
      anti_air_energy_amount += Math.max(
        0,
        anti_air_energy + tower.tower_damage_lvl * 25 - 25
      );
    }
  });

  //* Every Toxic Tower needs 75 Energy Points, reduced by 25 per upgrade level
  const toxic_energy = 75;
  let toxic_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "toxic") {
      toxic_energy_amount += Math.max(
        0,
        toxic_energy + tower.tower_damage_lvl * 25 - 25
      );
    }
  });

  //* Every Slower Tower needs 75 Energy Points, reduced by 25 per upgrade level
  const slower_energy = 75;
  let slower_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "slower") {
      slower_energy_amount += Math.max(
        0,
        slower_energy + tower.tower_damage_lvl * 25 - 25
      );
    }
  });

  save_obj.energy_level =
    save_obj.energy_level -
    destroyer_energy_amount -
    toxic_energy_amount -
    slower_energy_amount -
    anti_air_energy_amount;
}

//*#########################################################
//* ANCHOR -tower_type_amount
//*#########################################################

function tower_type_amount(towers, towertype) {
  let amount = 0;
  towers.forEach((tower) => {
    if (tower.tower_type === towertype) {
      amount++;
    }
  });
  return amount;
}

//*#########################################################
//* ANCHOR -Close new game level modal
//*#########################################################
btn_close_modal_lvl.addEventListener("click", () => {
  window.location.reload();
});

//*#########################################################
//* ANCHOR -Function to display if there is insufficient energy after purchasing a tower
//*#########################################################
function calc_energy_overdose() {
  const needed_energy_labels = document.querySelectorAll(".lbl-needed-energy");
  const energy_level = save_obj.energy_level;

  needed_energy_labels.forEach((needed_energy_label) => {
    const needed_energy = parseInt(
      needed_energy_label.getAttribute("data-needed_energy")
    );
    let existingSpan = needed_energy_label.querySelector("span");
    const diff = energy_level - needed_energy;
    if (diff < 0) {
      if (!existingSpan) {
        existingSpan = document.createElement("span");
        needed_energy_label.appendChild(existingSpan);
      }
      existingSpan.style.color = "red";
      existingSpan.style.fontSize = ".8rem";
      existingSpan.textContent = `(${diff})`;
    } else if (existingSpan) {
      existingSpan.remove();
    }
  });
}

//*#########################################################
//* ANCHOR -Function to set a class to the tile if there is not enough money to buy the tower
//*#########################################################
function set_class_for_overpriced_towers() {
  const tiles = document.querySelectorAll(".tile");
  const current_money = save_obj.money;

  tiles.forEach((tile) => {
    try {
      const tower_price = tile.getAttribute("data-tower_price");
      if (tower_price > current_money) {
        tile.classList.add("overpriced");
      } else {
        tile.classList.remove("overpriced");
      }
    } catch (error) {
      console.log(error);
    }
  });
}

//*ANCHOR - XP Store
//* Trap Discount
btn_trap_discount.addEventListener("click", () => {
  const price = btn_trap_discount.getAttribute("data-skill_price");
  const confirm = window.confirm(
    `Möchtest du den Rabatt für Fallen für ${price} XP-Coins kaufen?`
  );
  if (confirm) {
    const xp_transaction = check_XPCoins(price, "Fallen Rabatt");
    if (xp_transaction === true) {
      const item = return_Item_Amount_and_existence(save_obj, "trap_rabatt_50");

      if (item.available) {
        const item_index = item.index;
        save_obj.XP_Store_Items[item_index].amount += 10;
      } else {
        save_obj.XP_Store_Items.push({
          name: "trap_rabatt_50",
          amount: 10,
        });
      }
      save_obj.XP_Coins -= price;
      render_XP_Coins(save_obj);
      render_amount(save_obj);
      render_xp_on_homescreen();
      save_Game_without_saveDate();
    }
  }
});

//* Tower Discount
btn_tower_discount.addEventListener("click", () => {
  const price = btn_tower_discount.getAttribute("data-skill_price");
  const confirm = window.confirm(
    `Möchtest du den Tower Rabatt für ${price} XP-Coins kaufen?`
  );
  if (confirm) {
    const xp_transaction = check_XPCoins(price, "Tower Rabatt");
    if (xp_transaction === true) {
      const item = return_Item_Amount_and_existence(
        save_obj,
        "tower_rabatt_50"
      );

      if (item.available) {
        const item_index = item.index;
        save_obj.XP_Store_Items[item_index].amount += 10;
      } else {
        save_obj.XP_Store_Items.push({
          name: "tower_rabatt_50",
          amount: 10,
        });
      }
      save_obj.XP_Coins -= price;
      render_XP_Coins(save_obj);
      render_amount(save_obj);
      render_xp_on_homescreen();
      save_Game_without_saveDate();
    }
  }
});

btn_life_upgrade.addEventListener("click", () => {
  const price = btn_life_upgrade.getAttribute("data-skill_price");
  const confirm = window.confirm(
    `Möchtest du das Upgrade zum Leben generieren für ${price} XP-Coins kaufen?`
  );
  if (confirm) {
    const xp_transaction = check_XPCoins(price, "Leben Generierer");
    if (xp_transaction === true) {
      const item = return_Item_Amount_and_existence(save_obj, "live_generator");

      if (item.available) {
        new GameMessage(
          "Fehler",
          "Upgrade bereits vorhanden",
          "error",
          4000
        ).show_Message();
      } else {
        save_obj.XP_Store_Items.push({
          name: "live_generator",
          amount: 1,
        });
        save_obj.XP_Coins -= price;
        render_XP_Coins(save_obj);
        render_amount(save_obj);
        render_xp_on_homescreen();
        save_Game_without_saveDate();
      }
    }
  }
});

function render_xp_on_homescreen() {
  lbl_xp.innerHTML = `${save_obj.XP.toLocaleString(
    "de-DE"
  )} XP <br> ${save_obj.XP_Coins.toLocaleString("de-DE")} XP Coins`;
}

//*ANCHOR -  Function to check, if enough coins are available  - Respond with a message
function check_XPCoins(price, xp_objectname) {
  const current_XPCoins = save_obj.XP_Coins;
  // const current_XPCoins = 9000; //* zum testen
  if (current_XPCoins >= price) {
    const message = new GameMessage(
      "Kauf erfolgreich",
      `Kauf für "${xp_objectname}" abgeschlossen`,
      "success",
      4000
    ).show_Message();
    return true;
  } else {
    const message = new GameMessage(
      "Leider nicht möglich",
      `Zu wenig XPCredits für "${xp_objectname}"`,
      "error",
      3000
    ).show_Message();
    return false;
  }
}

canvas.addEventListener("mousemove", function (event) {
  // Canvas-Position im Dokument ermitteln
  const rect = canvas.getBoundingClientRect();

  // Mausposition relativ zum Canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  console.log(`x: ${x - 20}, y: ${y - 20}`);
});
