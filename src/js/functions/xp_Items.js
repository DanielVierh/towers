export function render_amount(save_object) {
    const lbl_trap_discount_amount = document.getElementById('lbl_trap_discount_amount');

    //* Render Trap Discount
    for(let i = 0; i < save_object.XP_Store_Items.length; i++) {
        if(save_object.XP_Store_Items[i].name === 'trap_rabatt_50') {
            lbl_trap_discount_amount.innerHTML = `${save_object.XP_Store_Items[i].amount}X`;
            break;
        }
    }
}

export function render_XP_Coins(save_obj) {
    const lbl_xp_store_coins = document.getElementById('lbl_xp_store_coins');

    lbl_xp_store_coins.innerHTML = `${save_obj.XP_Coins} XP-Coins`



}