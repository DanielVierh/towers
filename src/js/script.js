import { Creep } from "./classes/Creep.js";
import { BloodStain } from "./classes/BloodStain.js";
import { Laser } from "./classes/Laser.js";
import { GameMessage } from "./classes/GameMessage.js";
import { DeathEffect } from "./classes/DeathEffect.js";
import { AudioManager } from "./classes/AudioManager.js";

import { drawWaypoints, set_level } from "./functions/level.js";
import {
  render_amount,
  render_XP_Coins,
  return_Item_Amount_and_existence,
} from "./functions/xp_Items.js";
import { getRandomMinMax } from "./functions/helper_functions.js";
import {
  createGrid,
  buildObstaclesFromTowers,
  findPath,
  cellSize,
} from "./functions/pathfinding.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  });
}

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
  "btn_close_modal_towers",
);
const btn_Slower = document.getElementById("btn_Slower");
const btn_Destroyer = document.getElementById("btn_Destroyer");
const btn_Toxic = document.getElementById("btn_Toxic");
const btn_Sniper = document.getElementById("btn_Sniper");
const btn_energy = document.getElementById("btn_energy");
const btn_close_modal_upgrade = document.getElementById(
  "btn_close_modal_upgrade",
);
const mdl_upgrade = document.getElementById("mdl_upgrade");
const btn_show_tower_range = document.getElementById("btn_show_tower_range");
const menu_modal = document.getElementById("menu_modal");
const btn_start_game = document.getElementById("btn_start_game");
const btn_goto_menu = document.getElementById("btn_goto_menu");
const btn_pause = document.getElementById("btn_pause");
const btn_open_settings = document.getElementById("btn_open_settings");
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

// Trap SVG icons (cached as Images for canvas draw)
const TRAP_SVGS = {
  mine: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="34" r="18" fill="#222"/>
    <circle cx="26" cy="28" r="5" fill="#3a3a3a"/>
    <path d="M32 14c8 0 14 6 14 14" fill="none" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
    <path d="M46 16l6-6" fill="none" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  air_mine: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="34" r="18" fill="#222"/>
    <circle cx="26" cy="28" r="5" fill="#3a3a3a"/>
    <path d="M16 22l10 6" fill="none" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
    <path d="M48 22l-10 6" fill="none" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 14c8 0 14 6 14 14" fill="none" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
};

const TRAP_IMAGE_SOURCES = {
  spikes: "src/assets/mine/trap.png",
  emp_field: "src/assets/mine/emp_mine.svg",
};

const trapIconImages = new Map();
function getTrapIconImage(trapType) {
  const imageSrc = TRAP_IMAGE_SOURCES[trapType];
  if (imageSrc) {
    if (trapIconImages.has(trapType)) return trapIconImages.get(trapType);
    const img = new Image();
    img.src = imageSrc;
    trapIconImages.set(trapType, img);
    return img;
  }

  const svg = TRAP_SVGS[trapType];
  if (!svg) return null;
  if (trapIconImages.has(trapType)) return trapIconImages.get(trapType);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  trapIconImages.set(trapType, img);
  return img;
}
const btn_show_instructions = document.getElementById("btn_show_instructions");
const btn_mine = document.getElementById("btn_mine");
const btn_spikes = document.getElementById("btn_spikes");
const btn_emp_field = document.getElementById("btn_emp_field");
const lbl_XP = document.getElementById("lbl_XP");
const modal_select_lvl = document.getElementById("modal_select_lvl");
const level_0 = document.getElementById("level_0");
const level_1 = document.getElementById("level_1");
const level_2 = document.getElementById("level_2");
const level_3 = document.getElementById("level_3");
const level_4 = document.getElementById("level_4");
const level_5 = document.getElementById("level_5");
const level_6 = document.getElementById("level_6");
const level_random = document.getElementById("level_random");
const btn_close_modal_lvl = document.getElementById("btn_close_modal_lvl");
const lbl_xp = document.getElementById("lbl_xp");
const lbl_title = document.getElementById("lbl_title");
const btn_open_skill_menu = document.getElementById("btn_open_skill_menu");
const mdl_skill_tree = document.getElementById("mdl_skill_tree");
const btn_close_modal_skill = document.getElementById("btn_close_modal_skill");
const btn_trap_discount = document.getElementById("btn_trap_discount");
const btn_mine_charges_pack = document.getElementById("btn_mine_charges_pack");
const btn_tower_discount = document.getElementById("btn_tower_discount");
const btn_upgrade_discount = document.getElementById("btn_upgrade_discount");
const btn_start_money = document.getElementById("btn_start_money");
const btn_start_energy = document.getElementById("btn_start_energy");
const btn_mine_plus = document.getElementById("btn_mine_plus");
const btn_xp_multiplier = document.getElementById("btn_xp_multiplier");
const btn_sell_refund = document.getElementById("btn_sell_refund");
const btn_unlock_sniper_tower = document.getElementById(
  "btn_unlock_sniper_tower",
);
const btn_unlock_emp_field = document.getElementById("btn_unlock_emp_field");
const mdl_skill_purchase = document.getElementById("mdl_skill_purchase");
const btn_close_skill_purchase = document.getElementById(
  "btn_close_skill_purchase",
);
const btn_skill_qty_minus = document.getElementById("btn_skill_qty_minus");
const btn_skill_qty_plus = document.getElementById("btn_skill_qty_plus");
const btn_confirm_skill_purchase = document.getElementById(
  "btn_confirm_skill_purchase",
);
const lbl_skill_purchase_title = document.getElementById(
  "lbl_skill_purchase_title",
);
const lbl_skill_purchase_price = document.getElementById(
  "lbl_skill_purchase_price",
);
const lbl_skill_purchase_qty = document.getElementById(
  "lbl_skill_purchase_qty",
);
const lbl_skill_purchase_total = document.getElementById(
  "lbl_skill_purchase_total",
);
const lbl_skill_purchase_remaining = document.getElementById(
  "lbl_skill_purchase_remaining",
);
const check_trap_discount = document.getElementById("check_trap_discount");
const check_mine_charges = document.getElementById("check_mine_charges");
const check_tower_discount = document.getElementById("check_tower_discount");
const check_upgrade_discount = document.getElementById(
  "check_upgrade_discount",
);
const btn_life_upgrade = document.getElementById("btn_life_upgrade");
const tile_upgrade_liveGenerator = document.getElementById(
  "tile_upgrade_liveGenerator",
);
const btn_livegen = document.getElementById("btn_livegen");
const reset_game = document.getElementById("reset_game");
const btn_replay_same_map = document.getElementById("btn_replay_same_map");
const lbl_available_mines = document.getElementById("lbl_available_mines");
const lbl_needed_energy = document.getElementById("lbl_needed_energy");

// Audio
const audio = new AudioManager();
audio.bindUserGestureUnlock();

const btn_audio_mute = document.getElementById("btn_audio_mute");
const audio_volume = document.getElementById("audio_volume");
const btn_fx_shake = document.getElementById("btn_fx_shake");
const btn_fx_perf = document.getElementById("btn_fx_perf");
const mdl_settings = document.getElementById("mdl_settings");
const btn_close_modal_settings = document.getElementById(
  "btn_close_modal_settings",
);

// Daily loot modal
const dailyLootModal = document.getElementById("dailyLootModal");
const dailyLootBoxesRoot = document.getElementById("dailyLootBoxes");
const dailyLootClose = document.getElementById("dailyLootClose");
const dailyLootHint = document.getElementById("dailyLootHint");
const runLootModal = document.getElementById("runLootModal");
const runLootBoxesRoot = document.getElementById("runLootBoxes");
const runLootClose = document.getElementById("runLootClose");
const runLootHint = document.getElementById("runLootHint");

// Wave intro banner
const waveIntroBanner = document.getElementById("waveIntroBanner");
const waveIntroSpriteMain = document.getElementById("waveIntroSpriteMain");
const waveIntroSpriteSpecial1 = document.getElementById(
  "waveIntroSpriteSpecial1",
);
const waveIntroSpriteSpecial2 = document.getElementById(
  "waveIntroSpriteSpecial2",
);
const waveIntroText = document.getElementById("waveIntroText");
let waveIntroLastWaveKey = null;

function creepPreviewFrame1Src(creepIndex) {
  const idx = Number(creepIndex);
  if (!Number.isFinite(idx) || idx < 0) return null;
  const base = creep_properties?.[idx]?.src;
  if (!base || typeof base !== "string") return null;
  return `${base}/frame_1.png`;
}

function specialPreviewFrame1Src(specialIndex) {
  const idx = Number(specialIndex);
  if (!Number.isFinite(idx) || idx < 0) return null;
  const base = special_creeps?.[idx]?.src;
  if (!base || typeof base !== "string") return null;
  return `${base}/frame_1.png`;
}

function setWaveIntroVisible(visible) {
  if (!waveIntroBanner) return;
  if (visible) {
    waveIntroBanner.classList.add("active");
    waveIntroBanner.setAttribute("aria-hidden", "false");
  } else {
    waveIntroBanner.classList.remove("active");
    waveIntroBanner.classList.remove("animate");
    waveIntroBanner.setAttribute("aria-hidden", "true");
  }
}

function setWaveIntroSprites(mainSrc, specialSrcs = []) {
  const applyImg = (el, src) => {
    if (!el) return;
    if (!src) {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
    el.src = src;
    el.onerror = () => {
      el.style.display = "none";
    };
  };

  applyImg(waveIntroSpriteMain, mainSrc);
  applyImg(waveIntroSpriteSpecial1, specialSrcs[0]);
  applyImg(waveIntroSpriteSpecial2, specialSrcs[1]);
}

function showWaveIntroCountdown({ waveNumber, creepIndex, secondsLeft }) {
  if (!waveIntroBanner || !waveIntroText) return;

  const mainSrc = creepPreviewFrame1Src(creepIndex);
  const specialSrcs = [];
  const upcomingWave = Number(waveNumber);
  if (
    Number.isFinite(upcomingWave) &&
    upcomingWave !== 0 &&
    upcomingWave % 6 === 0
  ) {
    specialSrcs.push(specialPreviewFrame1Src(0));
  }
  if (
    Number.isFinite(upcomingWave) &&
    upcomingWave !== 0 &&
    upcomingWave % 10 === 0
  ) {
    specialSrcs.push(specialPreviewFrame1Src(1));
  }
  setWaveIntroSprites(mainSrc, specialSrcs.filter(Boolean));

  waveIntroText.textContent = `Welle ${waveNumber} in ${secondsLeft}s`;
  setWaveIntroVisible(true);
}

function triggerWaveIntroAnimateAndSound(waveNumber) {
  if (!waveIntroBanner) return;
  const key = String(waveNumber);
  if (waveIntroLastWaveKey === key) return;
  waveIntroLastWaveKey = key;

  waveIntroBanner.classList.remove("animate");
  void waveIntroBanner.offsetWidth;
  waveIntroBanner.classList.add("animate");

  audio.play("wave_intro", { force: true, cooldownMs: 0, volume: 0.95 });
}

// FX settings
const FX_STORAGE_KEY = "towers.fx";
const PERFORMANCE_PROFILE_ORDER = ["low", "medium", "high"];
const PERFORMANCE_PROFILES = {
  low: {
    label: "Niedrig",
    towerShotVisualModulo: 4,
    hitParticleMultiplier: 0.5,
    toxicFogIntervalMs: 260,
    toxicFogPuffMultiplier: 0.6,
  },
  medium: {
    label: "Mittel",
    towerShotVisualModulo: 2,
    hitParticleMultiplier: 0.75,
    toxicFogIntervalMs: 180,
    toxicFogPuffMultiplier: 1,
  },
  high: {
    label: "Hoch",
    towerShotVisualModulo: 1,
    hitParticleMultiplier: 1,
    toxicFogIntervalMs: 90,
    toxicFogPuffMultiplier: 1.2,
  },
};
const fxSettings = {
  screenShakeEnabled: true,
  performanceProfile: "medium",
};

function getPerformanceProfile() {
  return (
    PERFORMANCE_PROFILES[fxSettings.performanceProfile] ||
    PERFORMANCE_PROFILES.medium
  );
}

function loadFxSettings() {
  try {
    const raw = localStorage.getItem(FX_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.screenShakeEnabled === "boolean") {
      fxSettings.screenShakeEnabled = parsed.screenShakeEnabled;
    }
    if (
      typeof parsed?.performanceProfile === "string" &&
      PERFORMANCE_PROFILES[parsed.performanceProfile]
    ) {
      fxSettings.performanceProfile = parsed.performanceProfile;
    }
  } catch (e) {
    // ignore
  }
}

function saveFxSettings() {
  try {
    localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(fxSettings));
  } catch (e) {
    // ignore
  }
}

//*#########################################################
//* ANCHOR -Daily Loot
//*#########################################################

const DAILY_LOOT_STORAGE_KEY = "towers.daily_loot.v1";

function getLocalDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadDailyLootState() {
  try {
    const raw = localStorage.getItem(DAILY_LOOT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDailyLootState(state) {
  try {
    localStorage.setItem(DAILY_LOOT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function weightedPick(items) {
  const total = items.reduce((s, it) => s + (it.weight || 0), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight || 0;
    if (r <= 0) return it.value;
  }
  return items[items.length - 1].value;
}

function generateDailyRewards() {
  const pool = [
    { weight: 40, value: { kind: "xp_coins", amount: 500 } },
    { weight: 25, value: { kind: "xp_coins", amount: 1000 } },
    { weight: 10, value: { kind: "xp_coins", amount: 2000 } },
    { weight: 12, value: { kind: "item", name: "trap_rabatt_50", amount: 2 } },
    {
      weight: 10,
      value: { kind: "item", name: "mine_charges_3_pack", amount: 2 },
    },
    { weight: 6, value: { kind: "item", name: "tower_rabatt_50", amount: 2 } },
  ];

  const rewards = [];
  for (let i = 0; i < 3; i++) {
    rewards.push(weightedPick(pool));
  }
  return rewards;
}

function formatDailyReward(reward) {
  if (!reward) return "";
  if (reward.kind === "xp_coins") {
    return `+${Number(reward.amount).toLocaleString("de-DE")} XP-Coins`;
  }
  if (reward.kind === "item") {
    const nameMap = {
      trap_rabatt_50: "Fallen-Rabatt",
      tower_rabatt_50: "Tower-Rabatt",
      mine_charges_3_pack: "3er-Minen-Pack",
    };
    const label = nameMap[reward.name] ?? reward.name;
    return `+${reward.amount}x ${label}`;
  }
  return "Geschenk";
}

function addXpStoreAmount(itemName, delta) {
  const item = return_Item_Amount_and_existence(save_obj, itemName);
  if (item.available) {
    save_obj.XP_Store_Items[item.index].amount += delta;
  } else {
    save_obj.XP_Store_Items.push({ name: itemName, amount: delta });
  }
}

function applyDailyReward(reward) {
  if (!reward) return;

  if (reward.kind === "xp_coins") {
    save_obj.XP_Coins += Number(reward.amount) || 0;
    render_XP_Coins(save_obj);
    render_xp_on_homescreen();
    save_Game_without_saveDate();
    return;
  }

  if (reward.kind === "item") {
    addXpStoreAmount(reward.name, Number(reward.amount) || 0);
    render_amount(save_obj);
    save_Game_without_saveDate();
  }
}

function initDailyLoot() {
  if (!dailyLootModal || !dailyLootBoxesRoot || !dailyLootClose) return;

  const today = getLocalDateKey();
  let state = loadDailyLootState();

  const needsNew =
    !state ||
    state.dateKey !== today ||
    !Array.isArray(state.rewards) ||
    state.rewards.length !== 3;

  if (needsNew) {
    state = {
      dateKey: today,
      rewards: generateDailyRewards(),
      opened: [false, false, false],
    };
    saveDailyLootState(state);
  }

  if (!Array.isArray(state.opened) || state.opened.length !== 3) {
    state.opened = [false, false, false];
    saveDailyLootState(state);
  }

  const openedCount = state.opened.filter(Boolean).length;
  if (openedCount >= 3) {
    dailyLootModal.classList.remove("active");
    dailyLootModal.setAttribute("aria-hidden", "true");
    return;
  }

  // Show modal on first open of day (or until all 3 opened)
  dailyLootModal.classList.add("active");
  dailyLootModal.setAttribute("aria-hidden", "false");

  const boxButtons = dailyLootBoxesRoot.querySelectorAll(".daily-loot-box");
  boxButtons.forEach((btn) => {
    const index = Number(btn.getAttribute("data-box-index"));
    const frontEl = btn.querySelector(".dlb-front");
    const rewardEl = btn.querySelector(".dlb-reward");

    btn.classList.remove("is-opening");
    btn.classList.toggle("is-opened", Boolean(state.opened[index]));
    if (frontEl) {
      frontEl.textContent = state.opened[index]
        ? formatDailyReward(state.rewards[index])
        : "?";
    }
    if (rewardEl) rewardEl.textContent = "";

    btn.disabled = Boolean(state.opened[index]);

    btn.addEventListener(
      "click",
      () => {
        // reload latest state to avoid race
        const latest = loadDailyLootState() || state;
        if (latest.dateKey !== today) return;
        if (latest.opened?.[index]) return;

        btn.classList.add("is-opening");
        btn.disabled = true;

        const reward = latest.rewards[index];
        // Apply reward immediately (persist), then animate reveal
        applyDailyReward(reward);
        latest.opened[index] = true;
        saveDailyLootState(latest);

        setTimeout(() => {
          btn.classList.remove("is-opening");
          btn.classList.add("is-opened");
          const fEl = btn.querySelector(".dlb-front");
          if (fEl) {
            fEl.textContent = formatDailyReward(reward);
          } else {
            btn.textContent = formatDailyReward(reward);
          }
          const rEl = btn.querySelector(".dlb-reward");
          if (rEl) rEl.textContent = "";

          const count = (latest.opened || []).filter(Boolean).length;
          if (dailyLootHint) {
            dailyLootHint.textContent =
              count >= 3
                ? "Belohnungen eingesammelt!"
                : `Noch ${3 - count} Box(en) öffnen…`;
          }

          if (count >= 3) {
            dailyLootClose.disabled = false;
          }
        }, 520);
      },
      { once: false },
    );
  });

  // initial close state
  dailyLootClose.disabled = openedCount < 3;
  dailyLootClose.addEventListener("click", () => {
    const latest = loadDailyLootState() || state;
    const count = (latest.opened || []).filter(Boolean).length;
    if (count < 3) return;
    dailyLootModal.classList.remove("active");
    dailyLootModal.setAttribute("aria-hidden", "true");
  });
}

function formatPostRunReward(reward) {
  if (!reward) return "Geschenk";
  if (reward.kind === "xp_coins") {
    return `+${Number(reward.amount).toLocaleString("de-DE")} XP-Coins`;
  }
  if (reward.kind === "xp") {
    return `+${Number(reward.amount).toLocaleString("de-DE")} XP`;
  }
  if (reward.kind === "item") {
    const nameMap = {
      trap_rabatt_50: "Fallen-Rabatt",
      tower_rabatt_50: "Tower-Rabatt",
      upgrade_rabatt_50: "Upgrade-Rabatt",
      mine_charges_3_pack: "3er-Minen-Pack",
    };
    const label = nameMap[reward.name] ?? reward.name;
    return `+${reward.amount}x ${label}`;
  }
  return "Überraschung";
}

function applyPostRunReward(reward) {
  if (!reward) return;
  if (reward.kind === "xp_coins") {
    save_obj.XP_Coins += Number(reward.amount) || 0;
  } else if (reward.kind === "xp") {
    save_obj.XP += Number(reward.amount) || 0;
  } else if (reward.kind === "item") {
    addXpStoreAmount(reward.name, Number(reward.amount) || 0);
  }

  render_amount(save_obj);
  render_XP_Coins(save_obj);
  render_xp_on_homescreen();
  save_Game_without_saveDate();
}

function generatePostRunRewards(resultStats, win) {
  const kills = Number(resultStats?.kills) || 0;
  const waves = Number(resultStats?.waves) || 0;
  const dps = Number(resultStats?.dps) || 0;
  const score = waves * 8 + kills * 0.8 + dps * 0.1 + (win ? 90 : 20);

  const xpCoinMin = Math.max(150, Math.floor(score * 1.1));
  const xpCoinMax = Math.max(xpCoinMin + 120, Math.floor(score * 2.2));
  const xpMin = Math.max(20, Math.floor(score * 0.2));
  const xpMax = Math.max(xpMin + 30, Math.floor(score * 0.5));

  const pool = [
    {
      weight: 46,
      value: {
        kind: "xp_coins",
        amount: getRandomMinMax(xpCoinMin, xpCoinMax),
      },
    },
    {
      weight: 18,
      value: {
        kind: "xp_coins",
        amount: getRandomMinMax(
          Math.floor(xpCoinMax * 0.9),
          Math.floor(xpCoinMax * 1.5),
        ),
      },
    },
    {
      weight: 12,
      value: {
        kind: "xp",
        amount: getRandomMinMax(xpMin, xpMax),
      },
    },
    { weight: 9, value: { kind: "item", name: "trap_rabatt_50", amount: 2 } },
    {
      weight: 8,
      value: { kind: "item", name: "mine_charges_3_pack", amount: win ? 3 : 2 },
    },
    { weight: 6, value: { kind: "item", name: "tower_rabatt_50", amount: 2 } },
    {
      weight: 5,
      value: { kind: "item", name: "upgrade_rabatt_50", amount: 2 },
    },
  ];

  if (score >= 260) {
    pool.push({
      weight: 4,
      value: {
        kind: "xp_coins",
        amount: getRandomMinMax(
          Math.floor(xpCoinMax * 1.5),
          Math.floor(xpCoinMax * 2.4),
        ),
      },
    });
  }

  const rewards = [];
  for (let i = 0; i < 3; i++) {
    rewards.push(weightedPick(pool));
  }
  return rewards;
}

function showPostRunLoot(resultStats, win) {
  if (!runLootModal || !runLootBoxesRoot || !runLootClose) return;

  const rewards = generatePostRunRewards(resultStats, win);
  const opened = [false, false, false];

  runLootClose.disabled = true;
  if (runLootHint) {
    runLootHint.textContent = "Öffne alle 3 Boxen, um fortzufahren.";
  }

  runLootModal.classList.add("active");
  runLootModal.setAttribute("aria-hidden", "false");

  const boxButtons = runLootBoxesRoot.querySelectorAll(".daily-loot-box");
  boxButtons.forEach((btn) => {
    const index = Number(btn.getAttribute("data-box-index"));
    const frontEl = btn.querySelector(".dlb-front");
    const rewardEl = btn.querySelector(".dlb-reward");

    btn.classList.remove("is-opening", "is-opened");
    btn.disabled = false;
    if (frontEl) frontEl.textContent = "?";
    if (rewardEl) rewardEl.textContent = "";

    btn.onclick = () => {
      if (opened[index]) return;

      btn.classList.add("is-opening");
      btn.disabled = true;

      const reward = rewards[index];
      applyPostRunReward(reward);
      opened[index] = true;

      setTimeout(() => {
        btn.classList.remove("is-opening");
        btn.classList.add("is-opened");
        const fEl = btn.querySelector(".dlb-front");
        if (fEl) fEl.textContent = formatPostRunReward(reward);

        const count = opened.filter(Boolean).length;
        if (runLootHint) {
          runLootHint.textContent =
            count >= 3
              ? "Run-Loot eingesammelt!"
              : `Noch ${3 - count} Box(en) öffnen…`;
        }
        if (count >= 3) {
          runLootClose.disabled = false;
        }
      }, 520);
    };
  });

  runLootClose.onclick = () => {
    const count = opened.filter(Boolean).length;
    if (count < 3) return;
    runLootModal.classList.remove("active");
    runLootModal.setAttribute("aria-hidden", "true");
  };
}

function syncFxControls() {
  if (!btn_fx_shake) return;
  btn_fx_shake.textContent = fxSettings.screenShakeEnabled
    ? "Shake: an"
    : "Shake: aus";
  if (fxSettings.screenShakeEnabled) {
    btn_fx_shake.classList.remove("is-muted");
  } else {
    btn_fx_shake.classList.add("is-muted");
  }

  if (btn_fx_perf) {
    const profile = getPerformanceProfile();
    btn_fx_perf.textContent = `Effekte: ${profile.label}`;
  }
}

loadFxSettings();
syncFxControls();

if (btn_fx_shake) {
  btn_fx_shake.addEventListener("click", () => {
    fxSettings.screenShakeEnabled = !fxSettings.screenShakeEnabled;
    saveFxSettings();
    syncFxControls();
  });
}

if (btn_fx_perf) {
  btn_fx_perf.addEventListener("click", () => {
    const currentIndex = PERFORMANCE_PROFILE_ORDER.indexOf(
      fxSettings.performanceProfile,
    );
    const nextIndex =
      currentIndex < 0
        ? 1
        : (currentIndex + 1) % PERFORMANCE_PROFILE_ORDER.length;
    fxSettings.performanceProfile = PERFORMANCE_PROFILE_ORDER[nextIndex];
    saveFxSettings();
    syncFxControls();
  });
}

function syncAudioControls() {
  if (!btn_audio_mute || !audio_volume) return;
  audio_volume.value = String(Math.round(audio.volume * 100));
  if (audio.muted) {
    btn_audio_mute.textContent = "Sound: aus";
    btn_audio_mute.classList.add("is-muted");
  } else {
    btn_audio_mute.textContent = "Sound: an";
    btn_audio_mute.classList.remove("is-muted");
  }
}

if (btn_audio_mute) {
  btn_audio_mute.addEventListener("click", () => {
    audio.toggleMute();
    syncAudioControls();
  });
}

if (audio_volume) {
  audio_volume.addEventListener("input", () => {
    const v = Number(audio_volume.value) / 100;
    audio.setVolume(v);
    if (v > 0 && audio.muted) audio.setMuted(false);
    syncAudioControls();
  });
}

syncAudioControls();

let settingsPausedByModal = false;

function openSettingsModal() {
  if (!mdl_settings) return;
  if (game_is_running) {
    play_pause();
    settingsPausedByModal = true;
  } else {
    settingsPausedByModal = false;
  }

  syncAudioControls();
  syncFxControls();
  mdl_settings.classList.add("active");
  mdl_settings.style.display = "flex";
  mdl_settings.setAttribute("aria-hidden", "false");
}

function closeSettingsModal() {
  if (!mdl_settings) return;
  mdl_settings.classList.remove("active");
  mdl_settings.style.display = "none";
  mdl_settings.setAttribute("aria-hidden", "true");

  if (settingsPausedByModal && !game_is_running) {
    play_pause();
  }
  settingsPausedByModal = false;
}

if (btn_open_settings) {
  btn_open_settings.addEventListener("click", () => {
    openSettingsModal();
  });
}

if (btn_close_modal_settings) {
  btn_close_modal_settings.addEventListener("click", () => {
    closeSettingsModal();
  });
}

if (mdl_settings) {
  mdl_settings.addEventListener("click", (event) => {
    if (event.target === mdl_settings) {
      closeSettingsModal();
    }
  });
}

// Generic UI click SFX (kept subtle + rate-limited)
document.addEventListener(
  "click",
  (event) => {
    const target = event.target;
    if (!target || !target.closest) return;
    if (target.closest("#audio_controls")) return;
    if (
      target.closest(
        "button, .button, .button2, .button-buy, .button-sell, .close-button, .tile",
      )
    ) {
      audio.play("ui_click");
    }
  },
  { capture: true },
);

canvas.width = 400;
canvas.height = 400;

// Camera shake (screen shake / impact)
const cameraShake = {
  timeLeftMs: 0,
  durationMs: 0,
  intensityPx: 0,
  seed: 0,
  offsetX: 0,
  offsetY: 0,
};

function triggerScreenShake(intensityPx, durationMs = 140) {
  if (!fxSettings.screenShakeEnabled) return;
  const i = Math.max(0, Number(intensityPx) || 0);
  const d = Math.max(0, Number(durationMs) || 0);
  if (i <= 0 || d <= 0) return;

  // stack by taking the max intensity and extending time a bit
  cameraShake.intensityPx = Math.max(cameraShake.intensityPx, i);
  cameraShake.durationMs = Math.max(cameraShake.durationMs, d);
  cameraShake.timeLeftMs = Math.min(
    cameraShake.durationMs,
    Math.max(cameraShake.timeLeftMs, d),
  );
  cameraShake.seed = (cameraShake.seed + 1) % 100000;
}

function updateCameraShake(deltaTimeMs) {
  if (!fxSettings.screenShakeEnabled) {
    cameraShake.timeLeftMs = 0;
    cameraShake.offsetX = 0;
    cameraShake.offsetY = 0;
    return;
  }
  if (cameraShake.timeLeftMs <= 0) {
    cameraShake.offsetX = 0;
    cameraShake.offsetY = 0;
    cameraShake.intensityPx = 0;
    return;
  }

  cameraShake.timeLeftMs -= deltaTimeMs;
  const t = Math.max(0, cameraShake.timeLeftMs);
  const p = cameraShake.durationMs > 0 ? t / cameraShake.durationMs : 0;
  const decay = p * p; // quadratic decay
  const amp = cameraShake.intensityPx * decay;

  // pseudo-random but stable-ish per frame
  const r1 = Math.sin((performance.now() + cameraShake.seed * 17) * 0.05);
  const r2 = Math.cos((performance.now() + cameraShake.seed * 29) * 0.07);
  cameraShake.offsetX = r1 * amp;
  cameraShake.offsetY = r2 * amp;
}

function applyCameraTransform(ctx) {
  if (cameraShake.offsetX !== 0 || cameraShake.offsetY !== 0) {
    ctx.translate(cameraShake.offsetX, cameraShake.offsetY);
  }
}

// Particles (world-space + UI/screen-space)
const worldParticles = [];
const uiParticles = [];

class Particle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.vx = opts.vx ?? 0;
    this.vy = opts.vy ?? 0;
    this.ax = opts.ax ?? 0;
    this.ay = opts.ay ?? 0;
    this.radius = opts.radius ?? 2;
    this.lifeMs = opts.lifeMs ?? 350;
    this.ageMs = 0;
    this.color = opts.color ?? "rgba(255,255,255,0.9)";
    this.fade = opts.fade ?? true;
    this.grow = opts.grow ?? 0;
    this.alpha = opts.alpha ?? 1;
  }

  update(dtMs) {
    this.ageMs += dtMs;
    const dt = dtMs / 1000;
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.radius = Math.max(0.2, this.radius + this.grow * dt);
  }

  get dead() {
    return this.ageMs >= this.lifeMs;
  }

  draw(ctx) {
    const p = this.lifeMs > 0 ? Math.min(1, this.ageMs / this.lifeMs) : 1;
    const a = this.fade ? (1 - p) * (this.alpha ?? 1) : (this.alpha ?? 1);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function updateAndDrawParticles(ctx, dtMs, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(dtMs);
    p.draw(ctx);
    if (p.dead) particles.splice(i, 1);
  }
}

function colorForLaser(laserColor) {
  switch (laserColor) {
    case "blue":
      return "rgba(90,180,255,0.95)";
    case "green":
      return "rgba(80,220,120,0.95)";
    case "red":
      return "rgba(255,90,90,0.95)";
    case "missle":
      return "rgba(255,210,120,0.95)";
    case "sniper":
      return "rgba(255, 235, 120, 0.98)";
    default:
      return "rgba(255,255,255,0.9)";
  }
}

function spawnHitParticles(x, y, laserColor) {
  const baseColor = colorForLaser(laserColor);
  const profile = getPerformanceProfile();
  const count = Math.max(
    2,
    Math.round(
      (laserColor === "missle" ? 14 : 8) * profile.hitParticleMultiplier,
    ),
  );
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (laserColor === "missle" ? 90 : 70) + Math.random() * 60;
    worldParticles.push(
      new Particle(x, y, {
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        ay: 80,
        radius: 1.2 + Math.random() * 1.8,
        lifeMs: 220 + Math.random() * 200,
        color: baseColor,
        alpha: 1,
      }),
    );
  }

  // small smoke puff for missiles
  if (laserColor === "missle") {
    const smokeCount = Math.max(
      2,
      Math.round(8 * profile.hitParticleMultiplier),
    );
    for (let i = 0; i < smokeCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 25 + Math.random() * 30;
      worldParticles.push(
        new Particle(x, y, {
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          ay: -10,
          radius: 3.5 + Math.random() * 2,
          grow: 10,
          lifeMs: 420 + Math.random() * 220,
          color: "rgba(70,70,70,0.9)",
          alpha: 0.7,
        }),
      );
    }
  }
}

function spawnToxicFogAround(enemy, dtMs) {
  if (!enemy?.is_toxicated) return;
  const profile = getPerformanceProfile();
  enemy._toxicFogAccMs = (enemy._toxicFogAccMs ?? 0) + dtMs;
  if (enemy._toxicFogAccMs < profile.toxicFogIntervalMs) return;
  enemy._toxicFogAccMs = 0;

  const cx = enemy.pos_x + (enemy.width * enemy.scale) / 2;
  const cy = enemy.pos_y + (enemy.height * enemy.scale) / 2;
  const basePuffCount = 2 + Math.floor(Math.random() * 2);
  const puffCount = Math.max(
    1,
    Math.round(basePuffCount * profile.toxicFogPuffMultiplier),
  );
  for (let i = 0; i < puffCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 10;
    worldParticles.push(
      new Particle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, {
        vx: (Math.random() - 0.5) * 18,
        vy: -10 - Math.random() * 18,
        ay: -4,
        radius: 4 + Math.random() * 3,
        grow: 8,
        lifeMs: 650 + Math.random() * 250,
        color: "rgba(80,220,120,0.8)",
        alpha: 0.45,
      }),
    );
  }
}

function shouldRenderTowerShotVisual(towerType, tower) {
  if (!tower) return true;
  if (
    towerType !== "destroyer" &&
    towerType !== "toxic" &&
    towerType !== "slower"
  ) {
    return true;
  }

  const modulo = Math.max(1, getPerformanceProfile().towerShotVisualModulo);
  if (modulo <= 1) return true;

  const nextCounter = ((tower._visualShotCounter ?? -1) + 1) % modulo;
  tower._visualShotCounter = nextCounter;
  return nextCounter === 0;
}

function spawnLowEnergySparks(dtMs) {
  if (!(save_obj.energy_level < 0)) return;
  if (!lbl_energy) return;

  // throttle
  spawnLowEnergySparks._accMs = (spawnLowEnergySparks._accMs ?? 0) + dtMs;
  if (spawnLowEnergySparks._accMs < 60) return;
  spawnLowEnergySparks._accMs = 0;

  const canvasRect = canvas.getBoundingClientRect();
  const r = lbl_energy.getBoundingClientRect();
  const x0 = r.left - canvasRect.left + r.width - 8;
  const y0 = r.top - canvasRect.top + 10;

  const count = 1 + (Math.random() < 0.25 ? 1 : 0);
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
    const sp = 120 + Math.random() * 90;
    uiParticles.push(
      new Particle(x0, y0, {
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        ay: 240,
        radius: 1.1 + Math.random() * 1.2,
        lifeMs: 220 + Math.random() * 120,
        color: "rgba(255,220,120,0.95)",
        alpha: 1,
      }),
    );
  }
}

const enemies = [];
const lasers = [];
const bloodStains = [];
const deathEffects = [];
const moneyPopups = [];
const backgroundImage = new Image();
backgroundImage.src = "src/assets/bg/bg2.webp";
let waveTimer = 10; // Timer für die nächste Welle in Sekunden
let tower = undefined;
let show_tower_range = false;
let game_is_running = false;
let waypoint_color = "rgba(241, 207, 113, 0.9)";
let energy_animation_counter = 0;

// Free-build pathfinding grid and spawn points
let pathGrid = null;
let free_spawn_start = null;
let free_spawn_end = null;
let show_path_debug = true; // drücken: P um zu toggeln
let freeBuildPadding = 12; // pixels padding around towers when blocking cells

let max_mine_amount_per_wave = 3;
let current_mine_amount_per_wave = 3;

let selectedLevelIdForReplay = null;
let selectedLevelDetailsForReplay = null;
let selectedDifficultyForReplay = "easy";

let runStartedAtMs = 0;
let runTowerDamage = 0;
let runTowerStatsByType = {};

// Zeitstempel für die Delta-Time Berechnung in der Game-Loop
let lastTime = performance.now();

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
    {
      name: "mine_charges_3_pack",
      amount: 0,
    },
    {
      name: "upgrade_rabatt_50",
      amount: 0,
    },
    {
      name: "passive_start_money",
      amount: 0,
    },
    {
      name: "passive_start_energy",
      amount: 0,
    },
    {
      name: "passive_mine_plus",
      amount: 0,
    },
    {
      name: "passive_xp_multi",
      amount: 0,
    },
    {
      name: "passive_sell_refund",
      amount: 0,
    },
    {
      name: "unlock_sniper_tower",
      amount: 0,
    },
    {
      name: "unlock_emp_field",
      amount: 0,
    },
  ],
  save_date: new Date().toISOString(), // Deklariert das aktuelle Datum und die Uhrzeit
  active_game_target_wave: 0,
};

function ensureXpStoreItem(name, defaultAmount = 0) {
  if (!save_obj.XP_Store_Items) save_obj.XP_Store_Items = [];
  const existing = return_Item_Amount_and_existence(save_obj, name);
  if (!existing.available) {
    save_obj.XP_Store_Items.push({
      name,
      amount: defaultAmount,
    });
  }
}

function getPassiveLevel(name) {
  const item = return_Item_Amount_and_existence(save_obj, name);
  if (!item.available) return 0;
  const n = Number(item.amount);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function getXpMultiplier() {
  const lvl = getPassiveLevel("passive_xp_multi");
  // +10% pro Level
  return 1 + lvl * 0.1;
}

function xpGain(baseXp) {
  const base = Number(baseXp) || 0;
  if (base <= 0) return 0;
  const g = Math.round(base * getXpMultiplier());
  return Math.max(1, g);
}

function mineBonusPerWave() {
  return getPassiveLevel("passive_mine_plus");
}

function startMoneyBonus() {
  return getPassiveLevel("passive_start_money") * 100;
}

function startEnergyBonus() {
  return getPassiveLevel("passive_start_energy") * 25;
}

function getSellRefundFactor() {
  // base 60% + 5% pro Skill-Level
  const lvl = getPassiveLevel("passive_sell_refund");
  return 0.6 + lvl * 0.05;
}

function getTowerBaseRange(towerType) {
  if (towerType === "sniper") return 180;
  return 80;
}

function getTowerMaxRange(towerType) {
  if (towerType === "sniper") return 240;
  return 140;
}

function getSniperCooldownByLevel(level) {
  if (level >= 3) return 1500;
  if (level >= 2) return 2000;
  return 3000;
}

function isSniperUnlocked() {
  return getPassiveLevel("unlock_sniper_tower") > 0;
}

function isEmpFieldUnlocked() {
  return getPassiveLevel("unlock_emp_field") > 0;
}

function baseTowerCost(towerType) {
  switch (towerType) {
    case "energy":
      return 70;
    case "destroyer":
      return 50;
    case "slower":
      return 100;
    case "toxic":
      return 300;
    case "sniper":
      return 300;
    case "anti_air":
      return 100;
    case "mine":
      return 70;
    case "air_mine":
      return 70;
    case "spikes":
      return 90;
    case "emp_field":
      return 150;
    default:
      return 0;
  }
}

function parseMoneyValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function cloneLevelDetails(level) {
  if (!level) return null;
  return {
    ...level,
    waypoints: Array.isArray(level.waypoints)
      ? level.waypoints.map((wp) => ({ ...wp }))
      : [],
    tower_places: Array.isArray(level.tower_places)
      ? level.tower_places.map((tp) => ({ ...tp }))
      : [],
    spawn_start: level.spawn_start ? { ...level.spawn_start } : undefined,
    spawn_end: level.spawn_end ? { ...level.spawn_end } : undefined,
  };
}

function getTowerDisplayName(towerType) {
  switch (towerType) {
    case "destroyer":
      return "Destroyer";
    case "slower":
      return "Slower";
    case "toxic":
      return "Toxic";
    case "anti_air":
      return "Anti-Air";
    case "sniper":
      return "Sniper";
    case "energy":
      return "Energy";
    case "mine":
      return "Mine";
    case "air_mine":
      return "Air Mine";
    case "spikes":
      return "Spikes";
    default:
      return "Tower";
  }
}

function resetRunStats() {
  runStartedAtMs = performance.now();
  runTowerDamage = 0;
  runTowerStatsByType = {};
}

function ensureRunTowerStat(towerType) {
  const key = towerType || "unknown";
  if (!runTowerStatsByType[key]) {
    runTowerStatsByType[key] = {
      damage: 0,
      kills: 0,
      invested: 0,
    };
  }
  return runTowerStatsByType[key];
}

function recordTowerDamage(tower, amount) {
  const dmg = Number(amount);
  if (!tower || !Number.isFinite(dmg) || dmg <= 0) return;
  const stat = ensureRunTowerStat(tower.tower_type);
  stat.damage += dmg;
  if (stat.invested <= 0) {
    const invested =
      parseMoneyValue(tower.purchase_price_paid) +
      parseMoneyValue(tower.upgrade_spent);
    stat.invested = Math.max(stat.invested, invested);
  }
  runTowerDamage += dmg;
}

function recordTowerKill(tower) {
  if (!tower) return;
  const stat = ensureRunTowerStat(tower.tower_type);
  stat.kills += 1;
}

function buildEndscreenStats({ xp, coins, waves }) {
  const durationMs = Math.max(1, performance.now() - runStartedAtMs);
  const durationSec = durationMs / 1000;
  const dps = Math.max(0, Math.floor(runTowerDamage / durationSec));

  let bestTowerLabel = "-";
  let bestScore = -1;
  Object.entries(runTowerStatsByType).forEach(([towerType, stat]) => {
    const invested = Math.max(1, Number(stat.invested) || 0);
    const damage = Math.max(0, Number(stat.damage) || 0);
    const score = damage / invested;
    if (damage > 0 && score > bestScore) {
      bestScore = score;
      bestTowerLabel = `${getTowerDisplayName(towerType)} (${score.toFixed(2)} dmg/€)`;
    }
  });

  return {
    kills: Number(save_obj.total_kills) || 0,
    xp: Number(xp) || 0,
    coins: Number(coins) || 0,
    dps,
    bestTower: bestTowerLabel,
    waves: Math.max(0, Number(waves) || 0),
  };
}

function estimateUpgradeInvestment(tower) {
  let invested = 0;
  const damageLvl = parseMoneyValue(tower?.tower_damage_lvl) || 1;
  if (damageLvl >= 2) invested += 300;
  if (damageLvl >= 3) invested += 500;

  const baseRange = getTowerBaseRange(tower?.tower_type);
  const towerRange = parseMoneyValue(tower?.range) || baseRange;
  const rangeSteps = Math.max(0, Math.floor((towerRange - baseRange) / 20));
  invested += rangeSteps * 300;

  if (Number(tower?.live_gen) === 1) invested += 700;
  return invested;
}

function ensureTowerEconomyState(tower) {
  if (!tower) return;

  if (!tower.tower_is_build) {
    tower.purchase_price_paid = 0;
    tower.upgrade_spent = 0;
    return;
  }

  if (tower.purchase_price_paid === undefined) {
    tower.purchase_price_paid = baseTowerCost(tower.tower_type);
  } else {
    tower.purchase_price_paid = parseMoneyValue(tower.purchase_price_paid);
  }

  if (tower.upgrade_spent === undefined) {
    tower.upgrade_spent = estimateUpgradeInvestment(tower);
  } else {
    tower.upgrade_spent = parseMoneyValue(tower.upgrade_spent);
  }
}

function ensureTowerEconomyStateAll() {
  if (!Array.isArray(save_obj.tower_places)) return;
  save_obj.tower_places.forEach((towerPlace) =>
    ensureTowerEconomyState(towerPlace),
  );
}

function addTowerUpgradeInvestment(tower, amount) {
  if (!tower) return;
  ensureTowerEconomyState(tower);
  tower.upgrade_spent =
    parseMoneyValue(tower.upgrade_spent) + parseMoneyValue(amount);
}

function getTowerTotalInvestment(tower) {
  if (!tower || !tower.tower_is_build) return 0;
  ensureTowerEconomyState(tower);
  return (
    parseMoneyValue(tower.purchase_price_paid) +
    parseMoneyValue(tower.upgrade_spent)
  );
}

function getTowerSellPrice(tower) {
  if (!tower || !tower.tower_is_build) return 30;
  const totalInvestment = getTowerTotalInvestment(tower);
  const factor = Math.min(0.95, Math.max(0.25, getSellRefundFactor()));
  const fallbackCost = baseTowerCost(tower.tower_type);
  const basis = totalInvestment > 0 ? totalInvestment : fallbackCost;
  return basis > 0 ? Math.floor(basis * factor) : 30;
}

function resetTowerPlaceState(tower) {
  if (!tower) return;
  tower.tower_is_build = false;
  tower.tower_type = "";
  tower.tower_img = "";
  tower.tower_damage_lvl = 1;
  tower.range = 80;
  tower.cooldown = 0;
  tower.live_gen = 0;
  tower.kill_counter = 0;
  tower.purchase_price_paid = 0;
  tower.upgrade_spent = 0;
  delete tower.expiresAt;
  delete tower.charges;
  delete tower.lastTriggeredAt;
}

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
      "de-DE",
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
      syncSniperUnlockUI();
    } catch (error) {
      console.log(error);
    }
    initializeTowerImages();
    // If the saved game uses FreeBuild, re-initialize grid and spawn points
    if (save_obj.free_build) {
      try {
        pathGrid = createGrid(canvas.width, canvas.height, cellSize);
        free_spawn_start = save_obj.spawn_start || { x: -50, y: 20 };
        free_spawn_end = save_obj.spawn_end || { x: 450, y: 340 };
        buildObstaclesFromTowers(
          save_obj.tower_places || [],
          pathGrid,
          freeBuildPadding,
        );
      } catch (e) {
        console.log("Error initializing free_build grid:", e);
      }
    }
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

  // Ensure passive skills exist in older saves
  ensureXpStoreItem("passive_start_money", 0);
  ensureXpStoreItem("passive_start_energy", 0);
  ensureXpStoreItem("passive_mine_plus", 0);
  ensureXpStoreItem("passive_xp_multi", 0);
  ensureXpStoreItem("passive_sell_refund", 0);
  ensureXpStoreItem("unlock_sniper_tower", 0);
  ensureXpStoreItem("unlock_emp_field", 0);

  // Ensure consumables exist in older saves
  ensureXpStoreItem("mine_charges_3_pack", 0);
  ensureXpStoreItem("upgrade_rabatt_50", 0);

  // Ensure tower economy fields exist in older saves
  ensureTowerEconomyStateAll();
}

function syncSniperUnlockUI() {
  const unlocked = isSniperUnlocked();
  const empUnlocked = isEmpFieldUnlocked();
  if (btn_Sniper) {
    if (unlocked) {
      btn_Sniper.classList.remove("hidden");
    } else {
      btn_Sniper.classList.add("hidden");
    }
  }

  if (btn_emp_field) {
    if (empUnlocked) {
      btn_emp_field.classList.remove("hidden");
    } else {
      btn_emp_field.classList.add("hidden");
    }
  }

  if (btn_unlock_sniper_tower) {
    if (unlocked) {
      btn_unlock_sniper_tower.innerHTML = "Freigeschaltet";
      btn_unlock_sniper_tower.classList.add("disabled");
    } else {
      btn_unlock_sniper_tower.innerHTML = "Kaufen 15.000 <br />XP Coins";
      btn_unlock_sniper_tower.classList.remove("disabled");
    }
  }

  if (btn_unlock_emp_field) {
    if (empUnlocked) {
      btn_unlock_emp_field.innerHTML = "Freigeschaltet";
      btn_unlock_emp_field.classList.add("disabled");
    } else {
      btn_unlock_emp_field.innerHTML = "Kaufen 5.000 <br />XP Coins";
      btn_unlock_emp_field.classList.remove("disabled");
    }
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
  try {
    // ensure UI state is up to date (also controls checkbox visibility)
    render_amount(save_obj);
    render_XP_Coins(save_obj);
    syncSniperUnlockUI();
  } catch (e) {}
  initDailyLoot();
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
    extra_velocity: 1.2,
    extra_health: -80,
    scale: 0,
    resistent: ["anti_air", "air_mine"],
    extra_money_amount: 5,
  },
  {
    name: "Ground, slow",
    src: "src/assets/creeps/creep_4",
    extra_velocity: -0.8,
    extra_health: 50,
    scale: 0,
    resistent: ["toxic", "slower", "anti_air", "air_mine"],
    extra_money_amount: 1,
  },
  {
    name: "Ground, boss",
    src: "src/assets/creeps/creep_5",
    extra_velocity: -0.7,
    extra_health: 500,
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
    extra_health: 4000,
    scale: 0.6,
    resistent: ["slower", "anti_air", "air_mine", "toxic", "slower", "mine"],
    extra_money_amount: 100,
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

function call_special_creep(waveNumber = save_obj.wave) {
  const waveToSpawn = Number(waveNumber);

  if (waveToSpawn % 6 === 0) {
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
      amount,
      true,
    );
  }

  if (waveToSpawn % 10 === 0) {
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
      amount,
      false,
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
  amount,
  isBoss = false,
) {
  for (let i = 1; i <= amount; i++) {
    setTimeout(() => {
      let waypointsToUse = save_obj.waypoints;
      if (save_obj.free_build && pathGrid) {
        const path = findPath({ x: posX, y: posY }, free_spawn_end, pathGrid);
        waypointsToUse = path || [free_spawn_end];
      }
      // create creep and if we used a path from the pathfinder, set it explicitly
      const creep = new Creep(
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
        invisible,
      );
      creep.isBoss = Boolean(isBoss);
      if (
        save_obj.free_build &&
        pathGrid &&
        Array.isArray(waypointsToUse) &&
        waypointsToUse.length
      ) {
        creep.setPath(waypointsToUse);
      }
      enemies.push(creep);
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
    call_special_creep(save_obj.wave + 1);
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
          (save_obj.enemy_max_health - save_obj.enemy_max_health / 2 + 1),
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

    // determine path (if free_build) before creating creep
    let initialWaypoints = save_obj.waypoints;
    let usedPath = null;
    if (save_obj.free_build && pathGrid) {
      const p = findPath({ x: posX, y: posY }, free_spawn_end, pathGrid);
      usedPath = p || [free_spawn_end];
      initialWaypoints = save_obj.waypoints; // pass default, then set path
    }
    const newCreep = new Creep(
      posX,
      posY,
      width,
      height,
      imgFolder,
      scale,
      initialWaypoints,
      health,
      velocity,
      resistent,
      extra_money,
    );
    newCreep.isBoss = /boss/i.test(creep_properties[creep_index]?.name ?? "");
    if (usedPath) newCreep.setPath(usedPath);
    enemies.push(newCreep);
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
  const baseRange = getTowerBaseRange(tower?.tower_type);
  const maxRange = getTowerMaxRange(tower?.tower_type);
  const currentRange = parseMoneyValue(tower?.range) || baseRange;

  const maxSteps = Math.max(0, Math.floor((maxRange - baseRange) / 20));
  const step = Math.min(
    maxSteps,
    Math.max(0, Math.floor((currentRange - baseRange) / 20)),
  );

  switch (step) {
    case 0:
      return "rgba(255, 255, 255, 0.2)";
    case 1:
      return "rgb(0, 255, 55)";
    case 2:
      return "rgb(255, 217, 0)";
    case 3:
      return "rgba(255, 0, 0, 0.6)";
    default:
      return "rgba(255, 255, 255, 0.2)";
  }
}

//*#########################################################
//* ANCHOR -drawTowerPlaces
//*#########################################################

function drawTowerPlaces() {
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_is_build) {
      const isTrap =
        tower.tower_type === "mine" ||
        tower.tower_type === "air_mine" ||
        tower.tower_type === "spikes" ||
        tower.tower_type === "emp_field";

      // Default draw box (old sprites)
      let drawX = tower.x;
      let drawY = tower.y - 10;
      let drawW = 40;
      let drawH = 55;

      if (tower.tower_type === "spikes") {
        // Spikes use SVG icon
        drawX = tower.x - 15;
        drawY = tower.y - 15;
        drawW = 60;
        drawH = 60;
        const trapImg = getTrapIconImage("spikes");
        if (
          trapImg &&
          trapImg.complete &&
          trapImg.naturalWidth > 0 &&
          trapImg.naturalHeight > 0
        ) {
          ctx.drawImage(trapImg, drawX, drawY, drawW, drawH);
        }
      } else if (tower.tower_type === "emp_field") {
        drawX = tower.x - 15;
        drawY = tower.y - 15;
        drawW = 60;
        drawH = 60;
        const trapImg = getTrapIconImage("emp_field");
        if (
          trapImg &&
          trapImg.complete &&
          trapImg.naturalWidth > 0 &&
          trapImg.naturalHeight > 0
        ) {
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.drawImage(trapImg, drawX, drawY, drawW, drawH);
          ctx.strokeStyle = "rgba(120,220,255,0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tower.x + 15, tower.y + 15, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // All normal towers + normal mines use their original sprite
        const towerImage = towerImages.get(tower.tower_img);
        if (towerImage) {
          ctx.drawImage(towerImage, drawX, drawY, drawW, drawH);
        }
      }

      // Overlay: charges (mines) / remaining time (spikes)
      if (isTrap) {
        ctx.save();
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const badgeX = drawX + drawW - 6;
        const badgeY = drawY + 6;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";

        if (tower.tower_type === "mine" || tower.tower_type === "air_mine") {
          const charges = Number.isFinite(Number(tower.charges))
            ? Math.max(0, Math.floor(Number(tower.charges)))
            : 1;
          tower.charges = charges;
          ctx.fillText(String(charges), badgeX, badgeY);
        } else if (
          tower.tower_type === "spikes" ||
          tower.tower_type === "emp_field"
        ) {
          const remainingMs = (Number(tower.expiresAt) || 0) - Date.now();
          const remainingS = Math.max(0, Math.ceil(remainingMs / 1000));
          ctx.fillText(`${remainingS}s`, badgeX, badgeY);
        }
        ctx.restore();
      }
      //* Zeichne einen farbigen Rahmen um den Turm basierend auf der Upgrade-Stufe
      ctx.strokeStyle = getTowerColor(tower);
      ctx.lineWidth = 3;
      ctx.strokeRect(tower.x + 18, tower.y + 33, 10, 3);

      //* Zeichne Rahmen für live generator upgrade
      if (tower.live_gen == 1) {
        ctx.strokeStyle = "lightgreen";
        ctx.lineWidth = 2;
        ctx.strokeRect(tower.x + 28, tower.y + 5, 1, 1);

        ctx.font = "10px Arial";
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fillText(tower.kill_counter, tower.x + 15, tower.y + 30);
      }

      if (save_obj.energy_level < 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(tower.x + 5, tower.y, 30, 30);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(
          low_energy_symbol,
          "image/svg+xml",
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
        } else if (tower.tower_type === "spikes") {
          ctx.strokeStyle = "black";
        } else if (tower.tower_type === "emp_field") {
          ctx.strokeStyle = "rgba(120,220,255,0.95)";
        } else if (tower.tower_type === "sniper") {
          ctx.strokeStyle = "purple";
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
        ctx.fillStyle = "rgba(13, 138, 227, .9)";
        ctx.fillRect(tower.x + x_random_pos, tower.y, 7, 7);
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
  height2 = 0,
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
  lbl_Live.innerHTML = "0 Leben";
  //* Assign new XP and XP-Coins
  if (!save_obj.assign_XP) {
    audio.play("game_over", { force: true });
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
    let new_XP_Coins = Math.floor(
      (base_XP_Coins + save_obj.current_XP - live_Loss_Antibonus) / 1.5,
    );

    save_obj.XP_Coins += new_XP_Coins;

    if (save_obj.total_kills < 5) {
      save_obj.current_XP = 2;
      new_XP_Coins = 5;
    }
    const xpReward = Math.max(0, Math.floor(save_obj.current_XP / 2));
    const endscreenStats = buildEndscreenStats({
      xp: xpReward,
      coins: new_XP_Coins,
      waves: save_obj.wave - 1,
    });
    gxuShowEndscreen(false, endscreenStats);
    showPostRunLoot(endscreenStats, false);
    save_obj.assign_XP = true;
    // Entferne das Save-Datum, damit auf dem Startscreen kein Lade-Button mehr angezeigt wird
    if (save_obj.hasOwnProperty("save_date")) {
      delete save_obj.save_date;
    }
    // Schreibe das Save-Objekt ohne save_date in den localStorage
    save_Game_without_saveDate();
    // Verstecke den Load-Button sofort im UI
    if (btn_load_game) {
      btn_load_game.style.display = "none";
    }
  }
}

//*#########################################################
//* ANCHOR -GAMELOOP
//*#########################################################
let got_killed = false;
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

  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  updateCameraShake(deltaTime);

  // World render (shaken)
  ctx.save();
  applyCameraTransform(ctx);

  //* Hintergrundbild zeichnen
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  //* Zuerst die Waypoints zeichnen
  drawWaypoints(ctx, save_obj.waypoints, waypoint_color);

  // Debug: draw pathfinding grid and current enemy paths when free build
  if (save_obj.free_build && pathGrid && show_path_debug) {
    const { grid, cols, rows, cell } = pathGrid;
    ctx.save();
    // faint grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          ctx.fillStyle = "rgba(220,50,50,0.22)";
          ctx.fillRect(c * cell, r * cell, cell, cell);
        } else {
          ctx.strokeRect(c * cell, r * cell, cell, cell);
        }
      }
    }

    // draw spawn start / end
    if (free_spawn_start) {
      ctx.fillStyle = "rgba(0,0,255,0.9)";
      ctx.beginPath();
      ctx.arc(
        free_spawn_start.x + 10,
        free_spawn_start.y + 10,
        6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    if (free_spawn_end) {
      ctx.fillStyle = "rgba(255,165,0,0.95)";
      ctx.beginPath();
      ctx.arc(free_spawn_end.x, free_spawn_end.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // draw enemy planned paths as dashed lines and small waypoint dots
    enemies.forEach((e) => {
      if (e.waypoints && e.waypoints.length) {
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(0,200,0,0.9)";
        ctx.lineWidth = 2;
        ctx.moveTo(e.pos_x + e.width / 2, e.pos_y + e.height / 2);
        e.waypoints.forEach((wp) => {
          ctx.lineTo(wp.x, wp.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        // draw waypoint dots
        e.waypoints.forEach((wp) => {
          ctx.beginPath();
          ctx.fillStyle = "rgba(0,200,0,0.9)";
          ctx.arc(wp.x, wp.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.closePath();
      }
    });

    ctx.restore();
  }

  deathEffects.forEach((effect, i) => {
    effect.update(deltaTime);
    effect.draw(ctx);

    if (effect.finished && !effect.spawnedBlood) {
      bloodStains.push(
        new BloodStain(effect.x, effect.y, "src/assets/blood.png", 1.5),
      );
      effect.spawnedBlood = true;
    }

    if (effect.markedForDeletion) {
      deathEffects.splice(i, 1);
    }
  });

  // Zeichne und aktualisiere BloodStains (rückwärts iterieren zum sicheren Entfernen)
  for (let i = bloodStains.length - 1; i >= 0; i--) {
    const stain = bloodStains[i];
    stain.update();
    stain.draw(ctx);
    if (stain.markedForDeletion) {
      bloodStains.splice(i, 1);
    }
  }

  // Cleanup: abgelaufene Fallen mit Dauer entfernen
  {
    const nowEpoch = Date.now();
    let removedAny = false;
    save_obj.tower_places.forEach((tower) => {
      if (
        tower.tower_is_build &&
        (tower.tower_type === "spikes" || tower.tower_type === "emp_field")
      ) {
        const expiresAt = Number(tower.expiresAt) || 0;
        if (expiresAt && nowEpoch >= expiresAt) {
          resetTowerPlaceState(tower);
          removedAny = true;
        }
      }
    });
    if (removedAny && save_obj.free_build && pathGrid) {
      buildObstaclesFromTowers(
        save_obj.tower_places,
        pathGrid,
        freeBuildPadding,
      );
      enemies.forEach((enemy) => {
        try {
          const newPath = findPath(
            { x: enemy.pos_x, y: enemy.pos_y },
            free_spawn_end,
            pathGrid,
          );
          if (newPath) enemy.setPath(newPath);
        } catch (e) {
          // ignore
        }
      });
    }
  }

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

    // Toxic fog particles
    spawnToxicFogAround(enemy, deltaTime);

    // If enemy has reached the end of its waypoint path, mark for deletion and deduct life
    if (
      !enemy.markedForDeletion &&
      enemy.waypoints &&
      enemy.currentWaypointIndex >= enemy.waypoints.length
    ) {
      enemy.markedForDeletion = true;
      save_obj.live--;
      audio.play("life_lost");
      document.body.classList.add("red-flash");
      setTimeout(() => {
        document.body.classList.remove("red-flash");
      }, 300);
    }

    //* Markiere den Creeps zur Löschung, wenn er die Grenze überschreitet
    if (enemy.pos_x > 400) {
      enemy.markedForDeletion = true;
      save_obj.live--;
      audio.play("life_lost");

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
          30, // 30x30 ist die Towergröße
        );

        if (distance < tower.range) {
          //* Radius von 80 Pixeln

          if (enemy.markedForDeletion) {
            return;
          }

          // Stachelfeld: konstanter Schaden im Umkreis
          if (tower.tower_type === "spikes") {
            const dps = 390;
            const damage = dps * (deltaTime / 1000);
            enemy.health -= damage;
            recordTowerDamage(tower, damage);
          }

          if (enemy.health <= 0) {
            // Increase Total Kill Counter
            if (save_obj.total_kills === undefined) {
              save_obj.total_kills = 1;
            } else {
              save_obj.total_kills += 1;
            }
            recordTowerKill(tower);
            // Explosion starten
            deathEffects.push(
              new DeathEffect(
                enemy.pos_x + enemy.width / 2,
                enemy.pos_y + enemy.height / 2,
                1.3,
              ),
            );

            // Impact
            triggerScreenShake(
              enemy.isBoss ? 6.2 : 3.6,
              enemy.isBoss ? 220 : 150,
            );

            audio.play("creep_death");

            // Gegner markieren, damit er verschwindet
            enemy.markedForDeletion = true;

            // Geld + XP
            let earnedMoney = 0;
            if (save_obj.wave > 20) {
              earnedMoney = 2;
            } else if (save_obj.wave >= 4) {
              earnedMoney = 4;
            } else {
              earnedMoney = 10;
            }

            earnedMoney += enemy.extra_money;
            save_obj.current_XP += xpGain(1);
            save_obj.money += earnedMoney;

            // Live-Generation durch Tower-Kills
            if (tower.live_gen === 1) {
              tower.kill_counter += 1;
              (console.log("Tower Upgrade kill"), tower.kill_counter);

              if (tower.kill_counter === 20) {
                save_obj.live++;
                tower.kill_counter = 0;
                console.log("LIVE ++");
              }
            }

            // Geld-Popup
            moneyPopups.push({
              x: enemy.pos_x,
              y: enemy.pos_y,
              amount: `+${earnedMoney}`,
              opacity: 1,
            });
          }

          //* Verlangsamen des Gegners, wenn er von einem Slower-Turm getroffen wird
          //* Slower Tower
          if (tower.tower_type === "spikes") {
            // handled above (damage over time)
          } else if (tower.tower_type === "emp_field") {
            if (typeof enemy.applyEmpEffect === "function") {
              enemy.applyEmpEffect(1400);
            } else {
              enemy.applySlowEffect(0.05, 1400);
            }

            if (enemy.invisible) {
              enemy.invisible = false;
              enemy.wasInvisible = true;
            }

            if (shouldRenderTowerShotVisual("slower", tower)) {
              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "blue",
                  { targetRef: enemy, hitRadius: 10 },
                ),
              );
            }
            audio.play("laser_blue");
            tower.cooldown = 110;
          } else if (tower.tower_type === "slower") {
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
              if (enemy.isBoss) triggerScreenShake(2.2, 120);
              //* Erzeuge nur jeden zweiten Schuss visuell
              if (shouldRenderTowerShotVisual("slower", tower)) {
                lasers.push(
                  new Laser(
                    tower.x + 15,
                    tower.y,
                    enemy.pos_x,
                    enemy.pos_y,
                    "blue",
                    { targetRef: enemy, hitRadius: 10 },
                  ),
                );
              }
              audio.play("laser_blue");
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

                if (enemy.isBoss) triggerScreenShake(2.4, 130);

                //* Erzeuge nur jeden zweiten Schuss visuell
                if (shouldRenderTowerShotVisual("toxic", tower)) {
                  lasers.push(
                    new Laser(
                      tower.x + 15,
                      tower.y,
                      enemy.pos_x,
                      enemy.pos_y,
                      "green",
                      { targetRef: enemy, hitRadius: 10 },
                    ),
                  );
                }
                audio.play("laser_green");
              }
              tower.cooldown = 20; //* Setze die Abklingzeit auf 20 Frames
            }

            //* Destroyer Tower
          } else if (tower.tower_type === "destroyer") {
            //* Harm Enemy
            if (!enemy.resistent.includes("destroyer")) {
              enemy.health -= tower.tower_damage_lvl;
              recordTowerDamage(tower, tower.tower_damage_lvl);
              // Boss hit impact
              if (enemy.isBoss) triggerScreenShake(2.6, 110);
              // *Erzeuge nur jeden zweiten Schuss visuell
              if (shouldRenderTowerShotVisual("destroyer", tower)) {
                lasers.push(
                  new Laser(
                    tower.x + 15,
                    tower.y,
                    enemy.pos_x,
                    enemy.pos_y,
                    "red",
                    { targetRef: enemy, hitRadius: 10 },
                  ),
                );
              }
              audio.play("laser_red");
            }
            //* Cool Down
            tower.cooldown =
              1 + tower.tower_damage_lvl * 4 + low_energy_load_slowing_effect;

            //* >>> Sniper Tower <<<
          } else if (tower.tower_type === "sniper") {
            if (!enemy.markedForDeletion) {
              const sniperDamage = Math.max(0, Number(enemy.health) || 0);
              recordTowerDamage(tower, sniperDamage);
              enemy.health = 0;
              if (enemy.isBoss) triggerScreenShake(4.4, 170);

              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "sniper",
                  { targetRef: enemy, hitRadius: 12 },
                ),
              );
              audio.play("laser_red");

              if (save_obj.total_kills === undefined) {
                save_obj.total_kills = 1;
              } else {
                save_obj.total_kills += 1;
              }
              recordTowerKill(tower);

              deathEffects.push(
                new DeathEffect(
                  enemy.pos_x + enemy.width / 2,
                  enemy.pos_y + enemy.height / 2,
                  1.3,
                ),
              );

              triggerScreenShake(
                enemy.isBoss ? 6.2 : 3.6,
                enemy.isBoss ? 220 : 150,
              );
              audio.play("creep_death");

              enemy.markedForDeletion = true;

              let earnedMoney = 0;
              if (save_obj.wave > 20) {
                earnedMoney = 2;
              } else if (save_obj.wave >= 4) {
                earnedMoney = 4;
              } else {
                earnedMoney = 10;
              }

              earnedMoney += enemy.extra_money;
              save_obj.current_XP += xpGain(1);
              save_obj.money += earnedMoney;

              if (tower.live_gen === 1) {
                tower.kill_counter += 1;

                if (tower.kill_counter === 20) {
                  save_obj.live++;
                  tower.kill_counter = 0;
                }
              }

              moneyPopups.push({
                x: enemy.pos_x,
                y: enemy.pos_y,
                amount: `+${earnedMoney}`,
                opacity: 1,
              });
            }

            tower.cooldown =
              getSniperCooldownByLevel(tower.tower_damage_lvl) +
              low_energy_load_slowing_effect;

            //* >>> Anti Air Tower <<<
          } else if (tower.tower_type === "anti_air") {
            //* Discover invisible Enemy
            if (enemy.invisible) {
              enemy.invisible = false;
              enemy.wasInvisible = true;
              enemy.resistent = ["slower", "anti_air", "air_mine"];
            }
            //* Harm Enemy
            if (!enemy.resistent.includes("anti_air")) {
              const damage = tower.tower_damage_lvl * 70;
              enemy.health -= damage;
              recordTowerDamage(tower, damage);
              // Boss hit impact
              if (enemy.isBoss) triggerScreenShake(3.4, 140);
              // *Erzeuge Missle
              lasers.push(
                new Laser(
                  tower.x + 15,
                  tower.y,
                  enemy.pos_x,
                  enemy.pos_y,
                  "missle",
                  { targetRef: enemy, hitRadius: 12 },
                ),
              );
              audio.play("missile");
            }
            //* Cool Down
            tower.cooldown = 50;

            //* >>> Mine <<<
          } else if (tower.tower_type === "mine") {
            if (!enemy.resistent.includes("mine")) {
              if (enemy.markedForDeletion) return;
              const nowEpoch = Date.now();
              const last = Number(tower.lastTriggeredAt) || 0;
              if (nowEpoch - last < 250) return;
              tower.lastTriggeredAt = nowEpoch;
              if (tower.charges === undefined) tower.charges = 1;

              //* Mine Kill Count
              if (!got_killed) {
                save_obj.total_kills++;
                recordTowerKill(tower);
                got_killed = true;
              }
              setTimeout(() => {
                setTimeout(() => {
                  recordTowerDamage(
                    tower,
                    Math.max(0, Number(enemy.health) || 0),
                  );
                  enemy.health = 0;
                  enemy.markedForDeletion = true;
                  got_killed = false;
                }, 100);
                setTimeout(() => {
                  // Explosion-Animation anzeigen
                  triggerExplosion(tower.x + 20, tower.y);

                  // Charges reduzieren; nur bei 0 entfernen
                  const nextCharges = Math.max(
                    0,
                    (Number(tower.charges) || 1) - 1,
                  );
                  tower.charges = nextCharges;
                  if (nextCharges <= 0) {
                    resetTowerPlaceState(tower);
                    if (save_obj.free_build && pathGrid) {
                      buildObstaclesFromTowers(
                        save_obj.tower_places,
                        pathGrid,
                        freeBuildPadding,
                      );
                      enemies.forEach((enemy) => {
                        try {
                          const newPath = findPath(
                            { x: enemy.pos_x, y: enemy.pos_y },
                            free_spawn_end,
                            pathGrid,
                          );
                          if (newPath) enemy.setPath(newPath);
                        } catch (e) {}
                      });
                    }
                  }
                }, 50);
              }, 10);
            }
          } else if (tower.tower_type === "air_mine") {
            if (!enemy.resistent.includes("air_mine")) {
              if (enemy.markedForDeletion) return;
              const nowEpoch = Date.now();
              const last = Number(tower.lastTriggeredAt) || 0;
              if (nowEpoch - last < 250) return;
              tower.lastTriggeredAt = nowEpoch;
              if (tower.charges === undefined) tower.charges = 1;

              //* Mine Kill Count
              if (!got_killed) {
                save_obj.total_kills++;
                recordTowerKill(tower);
                got_killed = true;
              }
              setTimeout(() => {
                recordTowerDamage(
                  tower,
                  Math.max(0, Number(enemy.health) || 0),
                );
                enemy.health = 0;
                enemy.markedForDeletion = true;
                got_killed = false;
                setTimeout(() => {
                  // Explosion-Animation anzeigen
                  triggerExplosion(tower.x + 20, tower.y);

                  // Charges reduzieren; nur bei 0 entfernen
                  const nextCharges = Math.max(
                    0,
                    (Number(tower.charges) || 1) - 1,
                  );
                  tower.charges = nextCharges;
                  if (nextCharges <= 0) {
                    resetTowerPlaceState(tower);
                    if (save_obj.free_build && pathGrid) {
                      buildObstaclesFromTowers(
                        save_obj.tower_places,
                        pathGrid,
                        freeBuildPadding,
                      );
                      enemies.forEach((enemy) => {
                        try {
                          const newPath = findPath(
                            { x: enemy.pos_x, y: enemy.pos_y },
                            free_spawn_end,
                            pathGrid,
                          );
                          if (newPath) enemy.setPath(newPath);
                        } catch (e) {}
                      });
                    }
                  }
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
    if (
      laser.finished ||
      (laser.posX === laser.targetX && laser.posY === laser.targetY)
    ) {
      spawnHitParticles(laser.targetX, laser.targetY, laser.color);
      lasers.splice(index, 1);
    }
  });

  if (save_obj.live <= 0) {
    showGameOverModal();
    btn_goto_menu.classList.remove("hidden");
    btn_pause.classList.add("hidden");
    btn_save_game.classList.add("hidden");
    lbl_Live.style.color = "tomato";
    ctx.restore();
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
        80,
      );
      explosion.frame++; // Nächstes Frame
    } else {
      // Entferne die Explosion, wenn alle Frames gezeichnet wurden
      activeExplosions.splice(index, 1);
    }
  });

  // Particles: world-space (shaken)
  updateAndDrawParticles(ctx, deltaTime, worldParticles);

  // end world render
  ctx.restore();

  // UI-space particles (not shaken)
  spawnLowEnergySparks(deltaTime);
  updateAndDrawParticles(ctx, deltaTime, uiParticles);

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
  audio.play("explosion");

  // Impact
  triggerScreenShake(5.2, 180);
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

  // Show wave banner during the last 3 seconds before the next wave
  const upcomingWaveNumber = save_obj.wave + 1;
  const isEndPhase = save_obj.wave === save_obj.active_game_target_wave;
  if (!isEndPhase && upcomingWaveNumber <= save_obj.active_game_target_wave) {
    if (waveTimer > 0 && waveTimer <= 3) {
      showWaveIntroCountdown({
        waveNumber: upcomingWaveNumber,
        creepIndex: next_round_creep_index,
        secondsLeft: waveTimer,
      });
      if (waveTimer === 3) {
        triggerWaveIntroAnimateAndSound(upcomingWaveNumber);
      }
    } else {
      setWaveIntroVisible(false);
    }
  } else {
    setWaveIntroVisible(false);
  }

  if (waveTimer <= 0) {
    setWaveIntroVisible(false);

    const baseMines =
      save_obj.wave > Math.floor(save_obj.active_game_target_wave / 2) ? 5 : 3;
    max_mine_amount_per_wave = baseMines + mineBonusPerWave();
    current_mine_amount_per_wave = max_mine_amount_per_wave;
    lbl_available_mines.innerHTML = `${current_mine_amount_per_wave}/${max_mine_amount_per_wave} Minen verfügbar`;
    lbl_available_mines.classList.remove("empty");
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
      const baseInc = save_obj.wave;
      if (save_obj.free_build && save_obj.free_build_enemy_multiplier) {
        save_obj.max_enemy_amount += Math.ceil(
          baseInc * save_obj.free_build_enemy_multiplier,
        );
      } else {
        save_obj.max_enemy_amount += baseInc;
      }
      save_obj.enemy_max_health += 20;
    }
    // base income per wave
    let baseIncome = Math.floor(save_obj.wave * 2);
    if (save_obj.free_build && save_obj.free_build_per_wave_bonus) {
      baseIncome += Math.floor(
        save_obj.wave * save_obj.free_build_per_wave_bonus,
      );
    }
    save_obj.money += baseIncome;
    console.log(save_obj);
  }
}

//* Won Game
function won_game() {
  game_is_running = false;
  if (save_obj.assign_XP === false) {
    if (!save_obj.assign_XP) {
      save_obj.current_XP = Math.floor(
        save_obj.current_XP + xpGain(save_obj.wave * 30),
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
        base_XP_Coins + save_obj.current_XP - live_Loss_Antibonus,
      );

      save_obj.XP_Coins += new_XP_Coins;
      if (save_obj.current_XP > 0) {
        lbl_XP.innerHTML = ` +${save_obj.current_XP.toLocaleString(
          "de-DE",
        )} XP (${save_obj.XP.toLocaleString(
          "de-DE",
        )} XP) <br> ${new_XP_Coins} XP-Coins`;
      }
      const endscreenStats = buildEndscreenStats({
        xp: save_obj.current_XP,
        coins: new_XP_Coins,
        waves: save_obj.wave - 1,
      });
      gxuShowEndscreen(true, endscreenStats);
      showPostRunLoot(endscreenStats, true);
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

  let _found_place = false;
  save_obj.tower_places.forEach((place) => {
    if (
      x >= place.x &&
      x <= place.x + 30 &&
      y >= place.y &&
      y <= place.y + 30
    ) {
      _found_place = true;
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
        syncSniperUnlockUI();
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
          "lbl_upgr_current_money",
        );
        const lbl_upgr_current_energy = document.getElementById(
          "lbl_upgr_current_energy",
        );
        //* Show Upgrade for live gen
        const upgrade_live_gen = return_Item_Amount_and_existence(
          save_obj,
          "live_generator",
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
        if (tower.tower_type === "sniper") {
          towerDamageLvlElement.innerHTML = `Cooldown-Stufe: ${tower.tower_damage_lvl} / 3`;
        } else {
          towerDamageLvlElement.innerHTML = `Stärke: Stufe ${tower.tower_damage_lvl} / 3`;
        }
        towerRangeElement.innerHTML = `Reichweite: ${tower.range} / ${getTowerMaxRange(
          tower.tower_type,
        )}`;
        const currentSellPrice = getTowerSellPrice(tower);
        btn_SellTower.innerHTML = `Verkaufen +${currentSellPrice} €`;
        if (tower.tower_type === "energy") {
          lbl_needed_energy.style.display = "none";
        } else {
          lbl_needed_energy.style.display = "block";
          calc_energy_overdose();
        }
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
        if (tower.range >= getTowerMaxRange(tower.tower_type)) {
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
          if (tower.tower_type === "sniper") {
            document.getElementById("tile_upgrade_stronger_title").innerHTML =
              "Cool Down Upgrade";
            document.getElementById("tile_upgrade_stronger_descr").innerHTML =
              "Reduziert die Abklingzeit des Snipers deutlich";
          } else {
            document.getElementById("tile_upgrade_stronger_title").innerHTML =
              "Stärke Upgrade";
            document.getElementById("tile_upgrade_stronger_descr").innerHTML =
              "Erhöht die Stärke des Turms <br> 25 " + low_energy_symbol;
          }
        }
        applyUpgradeDiscountToModalPrices();
      }
    }
  });

  // If in free-build mode and no existing place was clicked, create a new place
  if (!_found_place && save_obj.free_build) {
    const newPlace = {
      x: Math.max(0, Math.min(canvas.width - 30, Math.floor(x) - 15)),
      y: Math.max(0, Math.min(canvas.height - 30, Math.floor(y) - 15)),
      tower_is_build: false,
      tower_damage_lvl: 1,
      tower_type: "",
      tower_img: "",
      range: 80,
      cooldown: 0,
      live_gen: 0,
      kill_counter: 0,
      purchase_price_paid: 0,
      upgrade_spent: 0,
    };
    save_obj.tower_places.push(newPlace);
    tower = newPlace;
    // open build modal for new place
    if (!game_is_running) {
      game_is_running = true;
    }
    play_pause();
    mdl_towers.style.display = "flex";
    syncSniperUnlockUI();
    const lbl_current_money = document.getElementById("lbl_current_money");
    const lbl_current_energy = document.getElementById("lbl_current_energy");
    lbl_current_money.innerHTML = `${save_obj.money} €`;
    lbl_current_energy.innerHTML = `${save_obj.energy_level}`;
    show_recuded_price_on_discount();
    calc_energy_overdose();
    set_class_for_overpriced_towers();
  }
});

// Toggle debug drawing with 'P'
window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
    show_path_debug = !show_path_debug;
    console.log("show_path_debug:", show_path_debug);
  }
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
  const oldPrice_spikes = 90;
  const new_price_spikes = oldPrice_spikes / 2;
  const oldPrice_emp = 150;
  const new_price_emp = oldPrice_emp / 2;
  const btn_ground_mine = document.getElementById("btn_ground_mine");
  const btn_spikes_buy = document.getElementById("btn_spikes_buy");
  const btn_emp_buy = document.getElementById("btn_emp_buy");
  const mine_rabatt = return_Item_Amount_and_existence(
    save_obj,
    "trap_rabatt_50",
  );
  const is_mine_discount = check_trap_discount.checked;
  const trigger_btn_air_mine = document.getElementById("trigger_btn_air_mine");
  if (mine_rabatt.available && mine_rabatt.amount > 0 && is_mine_discount) {
    btn_mine.setAttribute("data-tower_price", new_price_mine_ground);
    btn_air_mine.setAttribute("data-tower_price", new_price_mine_air);
    if (btn_spikes)
      btn_spikes.setAttribute("data-tower_price", new_price_spikes);
    if (btn_emp_field)
      btn_emp_field.setAttribute("data-tower_price", new_price_emp);
    btn_ground_mine.innerHTML = `Kaufen ${new_price_mine_ground}€`;
    trigger_btn_air_mine.innerHTML = `Kaufen ${new_price_mine_air}€`;
    if (btn_spikes_buy)
      btn_spikes_buy.innerHTML = `Kaufen ${new_price_spikes}€`;
    if (btn_emp_buy) btn_emp_buy.innerHTML = `Kaufen ${new_price_emp}€`;
  } else {
    btn_mine.setAttribute("data-tower_price", oldPrice_mine_ground);
    btn_air_mine.setAttribute("data-tower_price", oldPrice_mine_air);
    if (btn_spikes)
      btn_spikes.setAttribute("data-tower_price", oldPrice_spikes);
    if (btn_emp_field)
      btn_emp_field.setAttribute("data-tower_price", oldPrice_emp);
    btn_ground_mine.innerHTML = `Kaufen ${oldPrice_mine_ground}€`;
    trigger_btn_air_mine.innerHTML = `Kaufen ${oldPrice_mine_air}€`;
    if (btn_spikes_buy) btn_spikes_buy.innerHTML = `Kaufen ${oldPrice_spikes}€`;
    if (btn_emp_buy) btn_emp_buy.innerHTML = `Kaufen ${oldPrice_emp}€`;
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
const buy_btn_sniper = document.getElementById("buy_btn_sniper");

function show_recuded_price_on_discount() {
  const towerDiscount = return_Item_Amount_and_existence(
    save_obj,
    "tower_rabatt_50",
  );
  const tower_discount_selected = check_tower_discount.checked;
  if (towerDiscount) {
    const original_powerplant_price = 70;
    const original_destroyer_price = 50;
    const original_slower_price = 100;
    const original_toxic_price = 300;
    const original_antiair_price = 100;
    const original_sniper_price = 300;

    const new_powerplant_price = 70 / 2;
    const new_destroyer_price = 50 / 2;
    const new_slower_price = 100 / 2;
    const new_toxic_price = 300 / 2;
    const new_antiair_price = 100 / 2;
    const new_sniper_price = 300 / 2;

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
      if (buy_btn_sniper && btn_Sniper) {
        buy_btn_sniper.innerHTML = `Kaufen ${new_sniper_price}€`;
        btn_Sniper.setAttribute("data-tower_price", new_sniper_price);
      }
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
      if (buy_btn_sniper && btn_Sniper) {
        buy_btn_sniper.innerHTML = `Kaufen ${original_sniper_price}€`;
        btn_Sniper.setAttribute("data-tower_price", original_sniper_price);
      }
    }
  }
}

function getUpgradeDiscountedPrice(basePrice) {
  const item = return_Item_Amount_and_existence(save_obj, "upgrade_rabatt_50");
  const useDiscount =
    Boolean(check_upgrade_discount?.checked) &&
    item.available &&
    Number(item.amount) > 0;
  const base = Number(basePrice) || 0;
  return useDiscount ? Math.floor(base / 2) : base;
}

function applyUpgradeDiscountToModalPrices() {
  render_amount(save_obj);

  if (!tower || !tower.tower_is_build) return;

  const rangeBasePrice = 300;
  if (tower.range < getTowerMaxRange(tower.tower_type)) {
    const rangePrice = getUpgradeDiscountedPrice(rangeBasePrice);
    btn_bigger_range.setAttribute("data-upgrade_price", String(rangePrice));
    btn_bigger_range.innerHTML = `Kaufen ${rangePrice}€`;
  }

  if (tower.tower_damage_lvl < 3) {
    const strongerBasePrice =
      tower.tower_type === "energy"
        ? 300
        : tower.tower_damage_lvl === 2
          ? 500
          : 300;
    const strongerPrice = getUpgradeDiscountedPrice(strongerBasePrice);
    btn_Stronger.setAttribute("data-tower_price", String(strongerPrice));
    btn_Stronger.innerHTML = `Kaufen ${strongerPrice}€`;
  }

  if (
    tile_upgrade_liveGenerator &&
    !tile_upgrade_liveGenerator.classList.contains("hidden")
  ) {
    if (tower.live_gen === 1) {
      btn_livegen.innerHTML = "Aktiv";
      btn_livegen.setAttribute("data-tower_price", "700");
    } else {
      const liveGenPrice = getUpgradeDiscountedPrice(700);
      btn_livegen.setAttribute("data-tower_price", String(liveGenPrice));
      btn_livegen.innerHTML = `Kaufen ${liveGenPrice}€`;
    }
  }
}

if (check_upgrade_discount) {
  check_upgrade_discount.addEventListener("click", () => {
    applyUpgradeDiscountToModalPrices();
    calc_energy_overdose();
    set_class_for_overpriced_towers();
  });
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
//* ANCHOR -Set Spikes
//*#########################################################

if (btn_spikes) {
  btn_spikes.addEventListener("click", () => {
    set_Tower(btn_spikes, "spikes", 0, mdl_traps);
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
}

//*#########################################################
//* ANCHOR -Set EMP Field
//*#########################################################
if (btn_emp_field) {
  btn_emp_field.addEventListener("click", () => {
    if (!isEmpFieldUnlocked()) {
      new GameMessage(
        "EMP-Feld gesperrt",
        "Schalte das EMP-Feld zuerst im Skill Store frei.",
        "error",
        2500,
      ).show_Message();
      return;
    }

    set_Tower(btn_emp_field, "emp_field", 0, mdl_traps);
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
}

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
//* ANCHOR -Set Sniper Tower
//*#########################################################
if (btn_Sniper) {
  btn_Sniper.addEventListener("click", () => {
    if (!isSniperUnlocked()) {
      new GameMessage(
        "Sniper gesperrt",
        "Schalte den Sniper zuerst im Skill Store frei.",
        "error",
        2500,
      ).show_Message();
      return;
    }
    set_Tower(btn_Sniper, "sniper", 1, mdl_towers);
    substract_tower_discount();
  });
}

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

function substract_upgrade_discount() {
  const item = return_Item_Amount_and_existence(save_obj, "upgrade_rabatt_50");
  if (!item.available || item.amount <= 0) return;
  if (!check_upgrade_discount || !check_upgrade_discount.checked) return;

  save_obj.XP_Store_Items[item.index].amount -= 1;
  if (save_obj.XP_Store_Items[item.index].amount < 0) {
    save_obj.XP_Store_Items[item.index].amount = 0;
  }
  render_amount(save_obj);
  save_Game_without_saveDate();
}

//*#########################################################
//* ANCHOR -Set Tower Function
//*#########################################################

function set_Tower(tower_btn, tower_type, tower_damage_lvl, closing_modal) {
  const tower_price = parseMoneyValue(
    tower_btn.getAttribute("data-tower_price"),
  );
  const tower_img = tower_btn.getAttribute("data-tower_img");
  ensureTowerEconomyState(tower);
  if (save_obj.money >= tower_price) {
    //* Vorhandene Minen reduzieren
    console.log("tower_type", tower_type);

    if (
      tower_type === "mine" ||
      tower_type === "air_mine" ||
      tower_type === "spikes" ||
      tower_type === "emp_field"
    ) {
      if (current_mine_amount_per_wave === 0) {
        new GameMessage(
          "Keine Minen mehr vorhanden",
          "Du hast keine Minen mehr für diese Welle verfügbar",
          "error",
          3000,
        ).show_Message();
        return;
      } else {
        current_mine_amount_per_wave--;
        current_mine_amount_per_wave === 0
          ? lbl_available_mines.classList.add("empty")
          : lbl_available_mines.classList.remove("empty");
        lbl_available_mines.innerHTML = `${current_mine_amount_per_wave}/${max_mine_amount_per_wave} Minen verfügbar`;
      }
    }

    tower.tower_type = tower_type;
    tower.tower_img = tower_img;
    tower.tower_is_build = true;
    tower.tower_damage_lvl = tower_damage_lvl;
    tower.purchase_price_paid = tower_price;
    tower.upgrade_spent = 0;

    if (tower_type === "mine" || tower_type === "air_mine") {
      let charges = 1;
      const packs = return_Item_Amount_and_existence(
        save_obj,
        "mine_charges_3_pack",
      );
      const usePacks = Boolean(
        check_mine_charges && check_mine_charges.checked,
      );
      if (usePacks && packs.available && packs.amount > 0) {
        charges = 3;
        save_obj.XP_Store_Items[packs.index].amount -= 1;
        render_amount(save_obj);
        save_Game_without_saveDate();
      }
      tower.charges = charges;
      tower.lastTriggeredAt = 0;
    }

    if (tower_type === "spikes") {
      tower.expiresAt = Date.now() + 8000;
      tower.range = 55;
    }

    if (tower_type === "emp_field") {
      tower.expiresAt = Date.now() + 7000;
      tower.range = 75;
      tower.cooldown = 0;
    }

    if (tower_type === "sniper") {
      tower.range = getTowerBaseRange("sniper");
    }

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
    // If in free-build mode, update pathfinding obstacles and recalc paths
    if (save_obj.free_build && pathGrid) {
      buildObstaclesFromTowers(
        save_obj.tower_places,
        pathGrid,
        freeBuildPadding,
      );
      enemies.forEach((enemy) => {
        try {
          const newPath = findPath(
            { x: enemy.pos_x, y: enemy.pos_y },
            free_spawn_end,
            pathGrid,
          );
          if (newPath) enemy.setPath(newPath);
        } catch (e) {
          // ignore
        }
      });
    }
  } else {
    const show_not_enough_money = new GameMessage(
      "Kauf aktuell nicht möglich",
      "Du hast nicht genug Geld",
      "error",
      2000,
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
    btn_bigger_range.getAttribute("data-upgrade_price"),
  );
  const maxRange = getTowerMaxRange(tower?.tower_type);
  if (save_obj.money >= upgrade_price && tower.range < maxRange) {
    // Begrenze die Reichweite entsprechend des Tower-Typs
    tower.range += 20;
    save_obj.money -= upgrade_price;
    addTowerUpgradeInvestment(tower, upgrade_price);
    substract_upgrade_discount();
    towerRangeElement.innerHTML = `Reichweite: ${tower.range} / ${maxRange}`;
    mdl_upgrade.style.display = "none";
    play_pause();
  } else if (tower.range >= maxRange) {
    const error_msg = new GameMessage(
      "Maximale Reichweite erreicht!",
      "",
      "error",
      2000,
    ).show_Message();
  } else {
    const error_msg = new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000,
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
    addTowerUpgradeInvestment(tower, upgrade_price);
    substract_upgrade_discount();
    if (tower.tower_type === "sniper") {
      towerDamageLvlElement.innerHTML = `Cooldown-Stufe: ${tower.tower_damage_lvl} / 3`;
    } else {
      towerDamageLvlElement.innerHTML = `Schaden: Stufe ${tower.tower_damage_lvl}`;
    }
    mdl_upgrade.style.display = "none";
    play_pause();
  } else if (tower.tower_damage_lvl >= 3) {
    const error_msg = new GameMessage(
      "Maximale Upgrade Stufe erreicht!",
      "",
      "error",
      2000,
    ).show_Message();
  } else {
    const error_msg = new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000,
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
        2000,
      ).show_Message();
      return;
    }
    tower.live_gen = 1;
    tower.kill_counter = 0;
    save_obj.money -= upgrade_price;
    addTowerUpgradeInvestment(tower, upgrade_price);
    substract_upgrade_discount();
    mdl_upgrade.style.display = "none";
    play_pause();
  } else {
    new GameMessage(
      "Nicht genug Geld für das Upgrade!",
      "",
      "error",
      2000,
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
      const sell_price = getTowerSellPrice(tower);
      save_obj.money += sell_price;
      resetTowerPlaceState(tower);
      mdl_upgrade.style.display = "none";
      play_pause();
      if (save_obj.free_build && pathGrid) {
        buildObstaclesFromTowers(
          save_obj.tower_places,
          pathGrid,
          freeBuildPadding,
        );
        enemies.forEach((enemy) => {
          try {
            const newPath = findPath(
              { x: enemy.pos_x, y: enemy.pos_y },
              free_spawn_end,
              pathGrid,
            );
            if (newPath) enemy.setPath(newPath);
          } catch (e) {}
        });
      }
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
  }, 5000);
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
    5000,
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
  // Ensure free-build grid initialized when loading a free-build save
  if (save_obj.free_build) {
    try {
      pathGrid = createGrid(canvas.width, canvas.height, cellSize);
      free_spawn_start = save_obj.spawn_start || { x: -50, y: 20 };
      free_spawn_end = save_obj.spawn_end || { x: 450, y: 340 };
      buildObstaclesFromTowers(
        save_obj.tower_places || [],
        pathGrid,
        freeBuildPadding,
      );
    } catch (e) {
      console.log("Error initializing free-build on load:", e);
    }
  }
  game_is_running = true;
  resetRunStats();
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
  initialize_game(level_details, "0");
});

level_1.addEventListener("click", () => {
  const level_details = set_level("1");
  initialize_game(level_details, "1");
});

level_2.addEventListener("click", () => {
  const level_details = set_level("2");
  initialize_game(level_details, "2");
});

level_3.addEventListener("click", () => {
  const level_details = set_level("3");
  initialize_game(level_details, "3");
});

level_4.addEventListener("click", () => {
  const level_details = set_level("4");
  initialize_game(level_details, "4");
});

level_5.addEventListener("click", () => {
  const level_details = set_level("5");
  initialize_game(level_details, "5");
});

level_6.addEventListener("click", () => {
  const level_details = set_level("6");
  initialize_game(level_details, "6");
});

level_random.addEventListener("click", () => {
  const level_details = set_level("level_rnd");
  initialize_game(level_details, "level_rnd");
});

btn_start_game.addEventListener("click", () => {
  modal_select_lvl.style.display = "flex";
});

function initialize_game(level_details, selectedLevelId = null) {
  lbl_available_mines.innerHTML = `${current_mine_amount_per_wave}/${max_mine_amount_per_wave} Minen verfügbar`;
  save_obj.assign_XP = false;
  save_obj.current_XP = 0;
  modal_select_lvl.style.display = "none";
  const level = level_details;
  selectedLevelIdForReplay = selectedLevelId;
  selectedLevelDetailsForReplay = cloneLevelDetails(level);
  selectedDifficultyForReplay = sel_difficulty?.value || "easy";
  //* Set the max wave target for this round
  save_obj.active_game_target_wave = Math.floor(Math.random() * (50 - 20)) + 20;
  // save_obj.active_game_target_wave = 2; // * For testing debug
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
  //* Free build mode handling
  if (level.free_build) {
    save_obj.free_build = true;
    // start with no predefined tower places for free build
    save_obj.tower_places = [];
    pathGrid = createGrid(canvas.width, canvas.height, cellSize);
    free_spawn_start = level.spawn_start || { x: -50, y: 20 };
    free_spawn_end = level.spawn_end || { x: 450, y: 340 };
    // persist spawn positions so they are available on load
    save_obj.spawn_start = free_spawn_start;
    save_obj.spawn_end = free_spawn_end;
    buildObstaclesFromTowers(save_obj.tower_places, pathGrid, freeBuildPadding);
    // FreeBuild-specific settings
    save_obj.free_build_enemy_multiplier = 1.2;
    // set larger wave target for free build (override random)
    save_obj.active_game_target_wave = 70;
  } else {
    save_obj.free_build = false;
  }
  //* Set the current wave to 0
  save_obj.wave = 0;
  //* Set the maximum enemy amount
  save_obj.max_enemy_amount = 2;
  if (save_obj.free_build && save_obj.free_build_enemy_multiplier) {
    save_obj.max_enemy_amount = Math.ceil(
      save_obj.max_enemy_amount * save_obj.free_build_enemy_multiplier,
    );
  }
  //* Set the maximum enemy velocity
  save_obj.enemy_max_velocity = 1.5;
  //* Set the global waypoint color
  waypoint_color = level.waypoint_color;
  //* Set totalKills
  if (save_obj.total_kills === undefined) {
    save_obj.total_kills = 0;
  } else {
    save_obj.total_kills = 0;
  }
  start_game();
}

function start_game() {
  menu_modal.classList.remove("active");
  audio.play("start");
  const game_difficulty = sel_difficulty.value;

  set_difficulty(game_difficulty);
  resetRunStats();

  // FreeBuild: give extra starting money and per-wave bonus
  if (save_obj.free_build) {
    // give a substantial starting money buffer for creative placement
    const extraStart = 1500;
    save_obj.money += extraStart;
    // store per-wave bonus factor (added to default per-wave income)
    save_obj.free_build_per_wave_bonus = 3; // multiplies wave factor
  } else {
    save_obj.free_build_per_wave_bonus = 0;
  }

  // Apply passive start bonuses (from skill tree)
  save_obj.money += startMoneyBonus();
  save_obj.energy_start_level += startEnergyBonus();
  // initial mines for wave 0 UI
  max_mine_amount_per_wave = 3 + mineBonusPerWave();
  current_mine_amount_per_wave = max_mine_amount_per_wave;
  if (lbl_available_mines) {
    lbl_available_mines.innerHTML = `${current_mine_amount_per_wave}/${max_mine_amount_per_wave} Minen verfügbar`;
    lbl_available_mines.classList.remove("empty");
  }

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
      2000,
    ).show_Message();
  } else {
    const msg_pause = new GameMessage(
      "Spiel fortgesetzt",
      "",
      "",
      2000,
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
    "energy",
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
        destroyer_energy + tower.tower_damage_lvl * 25 - 25,
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
        anti_air_energy + tower.tower_damage_lvl * 25 - 25,
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
        toxic_energy + tower.tower_damage_lvl * 25 - 25,
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
        slower_energy + tower.tower_damage_lvl * 25 - 25,
      );
    }
  });

  //* Every Sniper Tower needs 100 Energy Points, reduced by 25 per upgrade level
  const sniper_energy = 100;
  let sniper_energy_amount = 0;
  save_obj.tower_places.forEach((tower) => {
    if (tower.tower_type === "sniper") {
      sniper_energy_amount += Math.max(
        0,
        sniper_energy + tower.tower_damage_lvl * 25 - 25,
      );
    }
  });

  save_obj.energy_level =
    save_obj.energy_level -
    destroyer_energy_amount -
    toxic_energy_amount -
    slower_energy_amount -
    anti_air_energy_amount -
    sniper_energy_amount;
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
      needed_energy_label.getAttribute("data-needed_energy"),
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
let skillPurchaseState = null;

function maxQtyByCoins(price) {
  const p = Number(price) || 0;
  if (p <= 0) return 0;
  return Math.max(0, Math.floor(save_obj.XP_Coins / p));
}

function closeSkillPurchaseModal() {
  if (!mdl_skill_purchase) return;
  mdl_skill_purchase.classList.remove("active");
  mdl_skill_purchase.style.display = "none";
  mdl_skill_purchase.setAttribute("aria-hidden", "true");
  skillPurchaseState = null;
}

function updateSkillPurchaseModalUI() {
  if (!skillPurchaseState) return;
  const { qty, maxQty, price, displayName } = skillPurchaseState;
  const total = qty * price;
  const remaining = save_obj.XP_Coins - total;

  if (lbl_skill_purchase_title) {
    lbl_skill_purchase_title.innerHTML = `${displayName}`;
  }
  if (lbl_skill_purchase_price) {
    lbl_skill_purchase_price.innerHTML = `Preis pro Kauf: ${price.toLocaleString("de-DE")} XP-Coins`;
  }
  if (lbl_skill_purchase_qty) {
    lbl_skill_purchase_qty.innerHTML = `${qty}`;
  }
  if (lbl_skill_purchase_total) {
    lbl_skill_purchase_total.innerHTML = `Gesamt: ${total.toLocaleString("de-DE")} XP-Coins`;
  }
  if (lbl_skill_purchase_remaining) {
    lbl_skill_purchase_remaining.innerHTML = `Verbleibend: ${remaining.toLocaleString("de-DE")} XP-Coins`;
    lbl_skill_purchase_remaining.style.color =
      remaining < 0 ? "tomato" : "white";
  }

  if (btn_skill_qty_minus) btn_skill_qty_minus.disabled = qty <= 1;
  if (btn_skill_qty_plus) btn_skill_qty_plus.disabled = qty >= maxQty;
  if (btn_confirm_skill_purchase) {
    btn_confirm_skill_purchase.disabled = qty <= 0 || remaining < 0;
    btn_confirm_skill_purchase.innerHTML =
      qty > 1 ? `Kaufen (${qty}x)` : "Kaufen";
  }
}

function openSkillPurchaseModal({
  displayName,
  price,
  maxQty,
  applyPurchase,
  blockedMessage,
}) {
  if (!mdl_skill_purchase) return;

  const normalizedPrice = Math.max(1, Number(price) || 0);
  const normalizedMaxQty = Math.max(0, Math.floor(Number(maxQty) || 0));

  if (normalizedMaxQty <= 0) {
    new GameMessage(
      "Kauf aktuell nicht möglich",
      blockedMessage || "Zu wenig XP-Coins oder bereits auf Maximum.",
      "error",
      3000,
    ).show_Message();
    return;
  }

  skillPurchaseState = {
    displayName,
    price: normalizedPrice,
    maxQty: normalizedMaxQty,
    qty: 1,
    applyPurchase,
  };

  mdl_skill_purchase.style.display = "flex";
  mdl_skill_purchase.classList.add("active");
  mdl_skill_purchase.setAttribute("aria-hidden", "false");
  updateSkillPurchaseModalUI();
}

function finalizeSkillPurchase() {
  if (!skillPurchaseState) return;

  const { qty, price, displayName, applyPurchase } = skillPurchaseState;
  const totalCost = qty * price;
  const ok = check_XPCoins(totalCost, displayName);
  if (!ok) return;

  const applied =
    typeof applyPurchase === "function" ? applyPurchase(qty) : false;
  if (!applied) return;

  save_obj.XP_Coins -= totalCost;
  render_XP_Coins(save_obj);
  render_amount(save_obj);
  render_xp_on_homescreen();
  syncSniperUnlockUI();
  save_Game_without_saveDate();
  closeSkillPurchaseModal();
}

if (btn_skill_qty_minus) {
  btn_skill_qty_minus.addEventListener("click", () => {
    if (!skillPurchaseState) return;
    skillPurchaseState.qty = Math.max(1, skillPurchaseState.qty - 1);
    updateSkillPurchaseModalUI();
  });
}

if (btn_skill_qty_plus) {
  btn_skill_qty_plus.addEventListener("click", () => {
    if (!skillPurchaseState) return;
    skillPurchaseState.qty = Math.min(
      skillPurchaseState.maxQty,
      skillPurchaseState.qty + 1,
    );
    updateSkillPurchaseModalUI();
  });
}

if (btn_confirm_skill_purchase) {
  btn_confirm_skill_purchase.addEventListener("click", () => {
    finalizeSkillPurchase();
  });
}

if (btn_close_skill_purchase) {
  btn_close_skill_purchase.addEventListener("click", () => {
    closeSkillPurchaseModal();
  });
}

if (mdl_skill_purchase) {
  mdl_skill_purchase.addEventListener("click", (event) => {
    if (event.target === mdl_skill_purchase) {
      closeSkillPurchaseModal();
    }
  });
}

function openPassiveSkillPurchase({ key, displayName, price, maxLevel }) {
  const current = getPassiveLevel(key);
  const remainingLevels = Math.max(0, maxLevel - current);
  const allowedQty = Math.min(maxQtyByCoins(price), remainingLevels);

  openSkillPurchaseModal({
    displayName,
    price,
    maxQty: allowedQty,
    blockedMessage:
      current >= maxLevel
        ? `"${displayName}" ist bereits auf Stufe ${maxLevel}.`
        : "Zu wenig XP-Coins.",
    applyPurchase: (qty) => {
      addXpStoreAmount(key, qty);
      return true;
    },
  });
}

//* Trap Discount
if (btn_trap_discount) {
  btn_trap_discount.addEventListener("click", () => {
    const price = Number(btn_trap_discount.getAttribute("data-skill_price"));
    openSkillPurchaseModal({
      displayName: "Fallen Rabatt",
      price,
      maxQty: maxQtyByCoins(price),
      blockedMessage: "Zu wenig XP-Coins für Fallen Rabatt.",
      applyPurchase: (qty) => {
        addXpStoreAmount("trap_rabatt_50", qty * 10);
        return true;
      },
    });
  });
}

//* Mine 3er-Pack (Charges)
if (btn_mine_charges_pack) {
  btn_mine_charges_pack.addEventListener("click", () => {
    const price = Number(
      btn_mine_charges_pack.getAttribute("data-skill_price"),
    );
    openSkillPurchaseModal({
      displayName: "3er-Minen-Pack",
      price,
      maxQty: maxQtyByCoins(price),
      blockedMessage: "Zu wenig XP-Coins für das 3er-Minen-Pack.",
      applyPurchase: (qty) => {
        addXpStoreAmount("mine_charges_3_pack", qty * 10);
        return true;
      },
    });
  });
}

//* Tower Discount
if (btn_tower_discount) {
  btn_tower_discount.addEventListener("click", () => {
    const price = Number(btn_tower_discount.getAttribute("data-skill_price"));
    openSkillPurchaseModal({
      displayName: "Tower Rabatt",
      price,
      maxQty: maxQtyByCoins(price),
      blockedMessage: "Zu wenig XP-Coins für Tower Rabatt.",
      applyPurchase: (qty) => {
        addXpStoreAmount("tower_rabatt_50", qty * 10);
        return true;
      },
    });
  });
}

//* Upgrade Discount
if (btn_upgrade_discount) {
  btn_upgrade_discount.addEventListener("click", () => {
    const price = Number(btn_upgrade_discount.getAttribute("data-skill_price"));
    openSkillPurchaseModal({
      displayName: "Upgrade Rabatt",
      price,
      maxQty: maxQtyByCoins(price),
      blockedMessage: "Zu wenig XP-Coins für Upgrade Rabatt.",
      applyPurchase: (qty) => {
        addXpStoreAmount("upgrade_rabatt_50", qty * 10);
        return true;
      },
    });
  });
}

if (btn_life_upgrade) {
  btn_life_upgrade.addEventListener("click", () => {
    const lifeItem = return_Item_Amount_and_existence(
      save_obj,
      "live_generator",
    );
    const price = Number(btn_life_upgrade.getAttribute("data-skill_price"));
    const maxQty = lifeItem.available ? 0 : Math.min(1, maxQtyByCoins(price));

    openSkillPurchaseModal({
      displayName: "Leben Generierer",
      price,
      maxQty,
      blockedMessage: lifeItem.available
        ? "Upgrade bereits vorhanden"
        : "Zu wenig XP-Coins.",
      applyPurchase: () => {
        if (lifeItem.available) return false;
        addXpStoreAmount("live_generator", 1);
        return true;
      },
    });
  });
}

if (btn_unlock_sniper_tower) {
  btn_unlock_sniper_tower.addEventListener("click", () => {
    const alreadyUnlocked = isSniperUnlocked();
    const price = Number(
      btn_unlock_sniper_tower.getAttribute("data-skill_price"),
    );
    const maxQty = alreadyUnlocked ? 0 : Math.min(1, maxQtyByCoins(price));

    openSkillPurchaseModal({
      displayName: "Sniper Tower",
      price,
      maxQty,
      blockedMessage: alreadyUnlocked
        ? "Der Sniper Tower ist bereits freigeschaltet."
        : "Zu wenig XP-Coins.",
      applyPurchase: () => {
        if (isSniperUnlocked()) return false;
        const unlockItem = return_Item_Amount_and_existence(
          save_obj,
          "unlock_sniper_tower",
        );
        if (unlockItem.available) {
          save_obj.XP_Store_Items[unlockItem.index].amount = 1;
        } else {
          save_obj.XP_Store_Items.push({
            name: "unlock_sniper_tower",
            amount: 1,
          });
        }
        return true;
      },
    });
  });
}

if (btn_unlock_emp_field) {
  btn_unlock_emp_field.addEventListener("click", () => {
    const alreadyUnlocked = isEmpFieldUnlocked();
    const price = Number(btn_unlock_emp_field.getAttribute("data-skill_price"));
    const maxQty = alreadyUnlocked ? 0 : Math.min(1, maxQtyByCoins(price));

    openSkillPurchaseModal({
      displayName: "EMP-Feld",
      price,
      maxQty,
      blockedMessage: alreadyUnlocked
        ? "Das EMP-Feld ist bereits freigeschaltet."
        : "Zu wenig XP-Coins.",
      applyPurchase: () => {
        if (isEmpFieldUnlocked()) return false;
        const unlockItem = return_Item_Amount_and_existence(
          save_obj,
          "unlock_emp_field",
        );
        if (unlockItem.available) {
          save_obj.XP_Store_Items[unlockItem.index].amount = 1;
        } else {
          save_obj.XP_Store_Items.push({
            name: "unlock_emp_field",
            amount: 1,
          });
        }
        return true;
      },
    });
  });
}

if (btn_start_money) {
  btn_start_money.addEventListener("click", () => {
    const price = Number(btn_start_money.getAttribute("data-skill_price"));
    openPassiveSkillPurchase({
      key: "passive_start_money",
      displayName: "Startgeld",
      price,
      maxLevel: 5,
    });
  });
}

if (btn_start_energy) {
  btn_start_energy.addEventListener("click", () => {
    const price = Number(btn_start_energy.getAttribute("data-skill_price"));
    openPassiveSkillPurchase({
      key: "passive_start_energy",
      displayName: "Startenergie",
      price,
      maxLevel: 5,
    });
  });
}

if (btn_mine_plus) {
  btn_mine_plus.addEventListener("click", () => {
    const price = Number(btn_mine_plus.getAttribute("data-skill_price"));
    openPassiveSkillPurchase({
      key: "passive_mine_plus",
      displayName: "+1 Mine pro Welle",
      price,
      maxLevel: 3,
    });
  });
}

if (btn_xp_multiplier) {
  btn_xp_multiplier.addEventListener("click", () => {
    const price = Number(btn_xp_multiplier.getAttribute("data-skill_price"));
    openPassiveSkillPurchase({
      key: "passive_xp_multi",
      displayName: "XP Multiplikator",
      price,
      maxLevel: 8,
    });
  });
}

if (btn_sell_refund) {
  btn_sell_refund.addEventListener("click", () => {
    const price = Number(btn_sell_refund.getAttribute("data-skill_price"));
    openPassiveSkillPurchase({
      key: "passive_sell_refund",
      displayName: "Refund beim Verkaufen",
      price,
      maxLevel: 5,
    });
  });
}

function render_xp_on_homescreen() {
  lbl_xp.innerHTML = `${save_obj.XP.toLocaleString(
    "de-DE",
  )} XP <br> ${save_obj.XP_Coins.toLocaleString("de-DE")} XP Coins`;
}

//*ANCHOR -  Function to check, if enough coins are available  - Respond with a message
function check_XPCoins(price, xp_objectname) {
  const current_XPCoins = save_obj.XP_Coins;
  // const current_XPCoins = 9000; //* zum testen
  if (current_XPCoins >= price) {
    audio.play("purchase_ok");
    const message = new GameMessage(
      "Kauf erfolgreich",
      `Kauf für "${xp_objectname}" abgeschlossen`,
      "success",
      4000,
    ).show_Message();
    return true;
  } else {
    audio.play("purchase_fail");
    const message = new GameMessage(
      "Leider nicht möglich",
      `Zu wenig XPCredits für "${xp_objectname}"`,
      "error",
      3000,
    ).show_Message();
    return false;
  }
}

//* Mouse Position for Debugging
canvas.addEventListener("mousemove", function (event) {
  // Canvas-Position im Dokument ermitteln
  const rect = canvas.getBoundingClientRect();

  // Mausposition relativ zum Canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // ! console.log(`x: ${x - 20}, y: ${y - 20}`);
});

function gxuShowEndscreen(win, stats) {
  const title = document.getElementById("gxu-title");
  const box = document.getElementById("gxu-modal-box");
  const overlay = document.getElementById("gxu-overlay");

  const parseStatNumber = (value) => {
    if (typeof value === "number") return Math.max(0, Math.floor(value));
    const digitsOnly = String(value ?? "").replace(/[^\d-]/g, "");
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  };

  const animateCount = (element, targetValue, duration = 900) => {
    if (!element) return;
    const target = Math.max(0, Math.floor(targetValue));
    const startAt = performance.now();

    const step = (now) => {
      const elapsed = now - startAt;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.floor(target * eased);
      element.textContent = current.toLocaleString("de-DE");
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (win) {
    title.textContent = "Gewonnen!";
    box.classList.add("gxu-win");
    title.classList.remove("gxu-gameover");
  } else {
    title.textContent = "Game Over";
    box.classList.remove("gxu-win");
    title.classList.add("gxu-gameover");
  }

  const elKills = document.getElementById("gxu-s-kills");
  const elXp = document.getElementById("gxu-s-xp");
  const elCoins = document.getElementById("gxu-s-coins");
  const elDps = document.getElementById("gxu-s-dps");
  const elBestTower = document.getElementById("gxu-s-best-tower");
  const elWaves = document.getElementById("gxu-s-waves");

  if (btn_replay_same_map) {
    btn_replay_same_map.disabled = !selectedLevelDetailsForReplay;
  }

  const kills = parseStatNumber(stats?.kills);
  const xp = parseStatNumber(stats?.xp);
  const coins = parseStatNumber(stats?.coins);
  const dps = parseStatNumber(stats?.dps);
  const bestTower = String(stats?.bestTower ?? "-");
  const waves = parseStatNumber(stats?.waves);

  animateCount(elKills, kills, 850);
  animateCount(elXp, xp, 1050);
  animateCount(elCoins, coins, 1200);
  animateCount(elDps, dps, 980);
  if (elBestTower) {
    elBestTower.textContent = bestTower;
  }
  animateCount(elWaves, waves, 900);

  box.classList.remove("gxu-ready");
  void box.offsetWidth;
  box.classList.add("gxu-ready");

  overlay.classList.add("gxu-active");
}
function gxuClose() {
  document.getElementById("gxu-overlay").classList.remove("gxu-active");
}

if (btn_replay_same_map) {
  btn_replay_same_map.addEventListener("click", () => {
    if (!selectedLevelDetailsForReplay) {
      new GameMessage(
        "Replay nicht verfügbar",
        "Bitte starte zuerst ein neues Spiel über die Level-Auswahl.",
        "error",
        2600,
      ).show_Message();
      return;
    }

    if (sel_difficulty && selectedDifficultyForReplay) {
      sel_difficulty.value = selectedDifficultyForReplay;
    }

    gxuClose();
    if (runLootModal) {
      runLootModal.classList.remove("active");
      runLootModal.setAttribute("aria-hidden", "true");
    }

    initialize_game(
      cloneLevelDetails(selectedLevelDetailsForReplay),
      selectedLevelIdForReplay,
    );
  });
}

reset_game.addEventListener("click", () => {
  window.location.reload();
});

// setTimeout(() => {
//   gxuShowEndscreen(true, { kills: 72, xp: 4100, coins: 18, waves: 16 });
// }, 900);
