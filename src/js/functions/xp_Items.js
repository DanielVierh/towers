
//* Display Amount of Items 
export function render_amount(save_obj) {
  const lbl_trap_discount_amount = document.getElementById("lbl_trap_discount_amount");
  const lbl_mine_discount_amount = document.getElementById("lbl_mine_discount_amount");

  //* Trap Discount
  const item = return_Item_Amount_and_Existens(save_obj, "trap_rabatt_50");
  if (item.available) {
    lbl_trap_discount_amount.innerHTML = `${item.amount}X`;
    lbl_mine_discount_amount.innerHTML = `${item.amount} X 50% Rabatt`;
  }
}

export function render_XP_Coins(save_obj) {
  const lbl_xp_store_coins = document.getElementById("lbl_xp_store_coins");
  lbl_xp_store_coins.innerHTML = `${save_obj.XP_Coins} XP-Coins`;
}


export function return_Item_Amount_and_Existens(save_obj, name) {
  for (let i = 0; i < save_obj.XP_Store_Items.length; i++) {
    if (save_obj.XP_Store_Items[i].name === name) {
      return {
        available: true,
        amount: save_obj.XP_Store_Items[i].amount,
        index: i
      };
    }
  }
}
