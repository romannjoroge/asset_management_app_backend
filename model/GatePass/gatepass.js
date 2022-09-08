const authorize = 'INSERT INTO gatepass (item_id, user_id, original_location_id, reason, leaving_time, days_gone) VALUES ($1, $2, $3, $4, $5, $6)'
const historyAllItems = 'SELECT item.name as item_name, leaving_time FROM gatepass INNER JOIN item ON item.item_id = gatepass.item_id'
const historyItem = 'SELECT i.name as item_name, leaving_time, reason, g.user_id, days_gone FROM gatepass as g INNER JOIN item as i ON i.item_id = g.item_id WHERE i.item_id = $1'
module.exports = {
    authorize,
    historyAllItems,
    historyItem
}