const getLocation = 'SELECT * FROM location WHERE location_id = $1'
const moveItem = 'UPDATE item SET location_id = $1 WHERE item_id = $2'
const displayItems = 'SELECT item.name, purchase_date, users.location.name AS location_name FROM item INNER JOIN users.location ON item.location_id = users.location.location_id'
const displayItem = 'SELECT item.name, purchase_date, users.location.name AS location_name FROM item INNER JOIN users.location ON item.location_id = users.location.location_id WHERE item.item_id = $1'
const getLocationID = 'SELECT location_id FROM location WHERE name=$1'

module.exports = {
    getLocation,
    moveItem,
    displayItems,
    displayItem,
    getLocationID
}