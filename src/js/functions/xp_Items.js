//* Display Amount of Items
export function render_amount(save_obj) {
  const lbl_trap_discount_amount = document.getElementById(
    "lbl_trap_discount_amount",
  );
  const lbl_mine_discount_amount = document.getElementById(
    "lbl_mine_discount_amount",
  );
  const lbl_mine_charges_pack_amount = document.getElementById(
    "lbl_mine_charges_pack_amount",
  );
  const lbl_mine_charges_amount = document.getElementById(
    "lbl_mine_charges_amount",
  );
  const lbl_tower_discount_amount = document.getElementById(
    "lbl_tower_discount_amount",
  );
  const lbl_upgrade_discount_amount = document.getElementById(
    "lbl_upgrade_discount_amount",
  );
  const lbl_upgrade_discount_modal_amount = document.getElementById(
    "lbl_upgrade_discount_modal_amount",
  );
  const lbl_buymenu_tower_discount_amount = document.getElementById(
    "lbl_buymenu_tower_discount_amount",
  );
  const checkbox_field_tower = document.getElementById("checkbox_field_tower");
  const checkbox_field_trap = document.getElementById("checkbox_field_trap");
  const checkbox_field_trap_charges = document.getElementById(
    "checkbox_field_trap_charges",
  );
  const checkbox_field_upgrade = document.getElementById(
    "checkbox_field_upgrade",
  );
  const check_upgrade_discount = document.getElementById(
    "check_upgrade_discount",
  );
  const check_mine_charges = document.getElementById("check_mine_charges");
  const tile_live_upgr = document.getElementById("tile_live_upgr");
  const tile_unlock_sniper = document.getElementById("tile_unlock_sniper");

  const lbl_start_money_amount = document.getElementById(
    "lbl_start_money_amount",
  );
  const lbl_start_energy_amount = document.getElementById(
    "lbl_start_energy_amount",
  );
  const lbl_mine_plus_amount = document.getElementById("lbl_mine_plus_amount");
  const lbl_xp_multiplier_amount = document.getElementById(
    "lbl_xp_multiplier_amount",
  );
  const lbl_wave_income_multiplier_amount = document.getElementById(
    "lbl_wave_income_multiplier_amount",
  );
  const lbl_sell_refund_amount = document.getElementById(
    "lbl_sell_refund_amount",
  );

  let use_discount = {
    trap_discount: false,
    tower_discount: false,
  };

  //* Show Amount of Trap Discount
  const item = return_Item_Amount_and_existence(save_obj, "trap_rabatt_50");
  if (item.available) {
    lbl_trap_discount_amount.innerHTML = `${item.amount}X`;
    lbl_mine_discount_amount.innerHTML = `${item.amount} X 50% Rabatt`;

    if (item.amount > 0) {
      checkbox_field_trap.style.display = "flex";
    } else {
      checkbox_field_trap.style.display = "none";
    }
  }

  //* Show Amount of 3x Mine Charges packs
  const mineCharges = return_Item_Amount_and_existence(
    save_obj,
    "mine_charges_3_pack",
  );
  if (mineCharges.available) {
    if (lbl_mine_charges_pack_amount) {
      lbl_mine_charges_pack_amount.innerHTML = `${mineCharges.amount}X`;
    }
    if (lbl_mine_charges_amount) {
      lbl_mine_charges_amount.innerHTML = `${mineCharges.amount} X 3er-Minen-Pack`;
    }

    if (checkbox_field_trap_charges) {
      if (mineCharges.amount > 0) {
        checkbox_field_trap_charges.style.display = "flex";
      } else {
        checkbox_field_trap_charges.style.display = "none";
        if (check_mine_charges) check_mine_charges.checked = false;
      }
    }
  }

  //* Show Amount of Tower Discount
  const tower_item = return_Item_Amount_and_existence(
    save_obj,
    "tower_rabatt_50",
  );
  if (tower_item.available) {
    lbl_tower_discount_amount.innerHTML = `${tower_item.amount}X`;
    lbl_buymenu_tower_discount_amount.innerHTML = `${tower_item.amount} X 50% Rabatt`;
  }

  //* Show Amount of Upgrade Discount
  const upgrade_item = return_Item_Amount_and_existence(
    save_obj,
    "upgrade_rabatt_50",
  );
  if (upgrade_item.available) {
    if (lbl_upgrade_discount_amount) {
      lbl_upgrade_discount_amount.innerHTML = `${upgrade_item.amount}X`;
    }
    if (lbl_upgrade_discount_modal_amount) {
      lbl_upgrade_discount_modal_amount.innerHTML = `${upgrade_item.amount} X 50% Rabatt`;
    }
    if (checkbox_field_upgrade) {
      if (upgrade_item.amount > 0) {
        checkbox_field_upgrade.style.display = "flex";
      } else {
        checkbox_field_upgrade.style.display = "none";
        if (check_upgrade_discount) check_upgrade_discount.checked = false;
      }
    }
  }

  //* Show if live upgrade is available
  const live_upgr = return_Item_Amount_and_existence(
    save_obj,
    "live_generator",
  );
  if (live_upgr.available) {
    tile_live_upgr.classList.add("is-active");
  } else if (tile_live_upgr) {
    tile_live_upgr.classList.remove("is-active");
  }

  //* Show if sniper unlock is available
  const sniper_unlock = return_Item_Amount_and_existence(
    save_obj,
    "unlock_sniper_tower",
  );
  if (
    tile_unlock_sniper &&
    sniper_unlock.available &&
    Number(sniper_unlock.amount) > 0
  ) {
    tile_unlock_sniper.classList.add("is-active");
  } else if (tile_unlock_sniper) {
    tile_unlock_sniper.classList.remove("is-active");
  }

  // Passive skills (levels)
  const startMoney = return_Item_Amount_and_existence(
    save_obj,
    "passive_start_money",
  );
  if (lbl_start_money_amount && startMoney.available) {
    lbl_start_money_amount.innerHTML = `Lv ${startMoney.amount}`;
  }

  const startEnergy = return_Item_Amount_and_existence(
    save_obj,
    "passive_start_energy",
  );
  if (lbl_start_energy_amount && startEnergy.available) {
    lbl_start_energy_amount.innerHTML = `Lv ${startEnergy.amount}`;
  }

  const minePlus = return_Item_Amount_and_existence(
    save_obj,
    "passive_mine_plus",
  );
  if (lbl_mine_plus_amount && minePlus.available) {
    lbl_mine_plus_amount.innerHTML = `Lv ${minePlus.amount}`;
  }

  const xpMulti = return_Item_Amount_and_existence(
    save_obj,
    "passive_xp_multi",
  );
  if (lbl_xp_multiplier_amount && xpMulti.available) {
    lbl_xp_multiplier_amount.innerHTML = `Lv ${xpMulti.amount}`;
  }

  const waveIncomeMulti = return_Item_Amount_and_existence(
    save_obj,
    "passive_wave_income_multi",
  );
  if (lbl_wave_income_multiplier_amount && waveIncomeMulti.available) {
    lbl_wave_income_multiplier_amount.innerHTML = `Lv ${waveIncomeMulti.amount}`;
  }

  const sellRefund = return_Item_Amount_and_existence(
    save_obj,
    "passive_sell_refund",
  );
  if (lbl_sell_refund_amount && sellRefund.available) {
    lbl_sell_refund_amount.innerHTML = `Lv ${sellRefund.amount}`;
  }
}

export function render_XP_Coins(save_obj) {
  const lbl_xp_store_coins = document.getElementById("lbl_xp_store_coins");
  lbl_xp_store_coins.innerHTML = `${save_obj.XP_Coins.toLocaleString(
    "de-DE",
  )} XP-Coins`;
}

export function return_Item_Amount_and_existence(save_obj, name) {
  let return_obj = {
    available: false,
    amount: 0,
    index: -1,
  };

  for (let i = 0; i < save_obj.XP_Store_Items.length; i++) {
    if (save_obj.XP_Store_Items[i].name === name) {
      return_obj.available = true;
      return_obj.amount = save_obj.XP_Store_Items[i].amount;
      return_obj.index = i;
      break;
    }
  }
  return return_obj;
}
