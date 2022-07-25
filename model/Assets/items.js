const addItem = 'INSERT into Assets.item (category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew) VALUES($1, $2, $3, $4, $5, $6, $7)'
const removeItem = 'DELETE FROM Assets.item WHERE item_id = $1'
const updateItem = 'UPDATE Assets.item SET name = $1, category_id = $2, purchase_date = $3, purchase_amount = $4, next_dep_date = $5, accum_dep = $6, isnew = $7 WHERE item_id = $8'
const getAllItems = 'SELECT name, category_id, purchase_date FROM Assets.item'
const getItem = 'SELECT * FROM Assets.item WHERE item_id = $1'

module.exports = {
    addItem,
    removeItem,
    updateItem,
    getAllItems,
    getItem
}