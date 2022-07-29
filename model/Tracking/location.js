const getLocation = 'SELECT * FROM Users.location WHERE location_id = $1'
const moveItem = 'UPDATE assets.item SET location_id = $1 WHERE item_id = $2'
const displayItems = 'SELECT assets.item.name, purchase_date, users.location.name AS location_name FROM assets.item INNER JOIN users.location ON assets.item.location_id = users.location.location_id'
const displayItem = 'SELECT assets.item.name, purchase_date, users.location.name AS location_name FROM assets.item INNER JOIN users.location ON assets.item.location_id = users.location.location_id WHERE assets.item.item_id = $1'

module.exports = {
    getLocation,
    moveItem,
    displayItems,
    displayItem
}