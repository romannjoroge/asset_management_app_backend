const addItem = "INSERT INTO item(item_id, category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew, location_id, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'None')"
const removeItem = 'DELETE FROM item WHERE item_id = $1'
const updateItem = 'UPDATE item SET name = $1, category_id = $2, purchase_amount = $3, purchase_date = $4, next_dep_date = $5, accum_dep = $6, isnew = $7, location_id = $8 WHERE item_id = $9'
const getAllItems = `
                    SELECT i.name, c.name AS category_name, i.purchase_date, l.name AS location_name FROM item i INNER JOIN 
                    category c ON i.category_id = c.category_id INNER JOIN location l ON i.location_id = l.location_id
`
const getItem = `
                SELECT i.item_id, i.name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew, l.name AS location_name,
                c.name AS category_name, u.username AS username FROM item i INNER JOIN location l ON l.location_id = i.location_id 
                INNER JOIN category c ON i.category_id = c.category_id INNER JOIN users u ON i.user_id = u.user_id WHERE item_id = $1
`

module.exports = {
    addItem,
    removeItem,
    updateItem,
    getAllItems,
    getItem
}

