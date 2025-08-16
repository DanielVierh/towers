

//* Display Amount of Items 
export function render_amount(save_obj) {
  const lbl_trap_discount_amount = document.getElementById("lbl_trap_discount_amount");
  const lbl_mine_discount_amount = document.getElementById("lbl_mine_discount_amount");
  const lbl_tower_discount_amount = document.getElementById("lbl_tower_discount_amount");
  const lbl_buymenu_tower_discount_amount = document.getElementById("lbl_buymenu_tower_discount_amount");
  const checkbox_field_tower = document.getElementById('checkbox_field_tower');
  const checkbox_field_trap = document.getElementById('checkbox_field_trap');



  let use_discount = {
    trap_discount: false,
    tower_discount: false
  }

  //* Show Amount of Trap Discount
  const item = return_Item_Amount_and_existence(save_obj, "trap_rabatt_50");
  if (item.available) {
    lbl_trap_discount_amount.innerHTML = `${item.amount}X`;
    lbl_mine_discount_amount.innerHTML = `${item.amount} X 50% Rabatt`;

    if(item.amount > 0) {
      checkbox_field_trap.style.display = 'block';
    }else {
      checkbox_field_trap.style.display = 'none';
    }
  }

  //* Show Amount of Tower Discount
  const tower_item = return_Item_Amount_and_existence(save_obj, 'tower_rabatt_50');
  if(tower_item.available) {
    lbl_tower_discount_amount.innerHTML = `${tower_item.amount}X`;
    lbl_buymenu_tower_discount_amount.innerHTML = `${tower_item.amount} X 50% Rabatt`;
  }
}

export function render_XP_Coins(save_obj) {
  const lbl_xp_store_coins = document.getElementById("lbl_xp_store_coins");
  lbl_xp_store_coins.innerHTML = `${save_obj.XP_Coins.toLocaleString(
      "de-DE"
    )} XP-Coins`;
}


export function return_Item_Amount_and_existence(save_obj, name) {
  let return_obj = {
        available: false,
        amount: 0,
        index: -1
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
