const getLocation = 'SELECT * FROM location WHERE location_id = $1'
const moveItem = 'UPDATE item SET location_id = $1 WHERE item_id = $2'
const displayItems = 'SELECT item.name, purchase_date, users.location.name AS location_name FROM item INNER JOIN users.location ON item.location_id = users.location.location_id'
const displayItem = 'SELECT item.name, purchase_date, users.location.name AS location_name FROM item INNER JOIN users.location ON item.location_id = users.location.location_id WHERE item.item_id = $1'
const getLocationID = 'SELECT location_id FROM location WHERE name=$1'
const getLocationNames = 'SELECT name FROM Location WHERE branch_id = $1'
const getBranches = 'SELECT name, branch_id FROM branch'
const getLocationFromName = 'SELECT location_id FROM location WHERE name=$1 AND branch_id=$2'
const getBranch = 'SELECT name FROM branch WHERE branch_id=$1'
const getBranchFromName = 'SELECT branch_id FROM branch WHERE name=$1'
const addLocation = 'INSERT INTO location(branch_id, name) VALUES($1, $2)'
const addBranch = 'INSERT INTO branch(company_id, city, name) VALUES(1, $1, $2)'

module.exports = {
    getLocation,
    moveItem,
    displayItems,
    displayItem,
    getLocationID,
    getLocationNames,
    getBranches,
    getBranch,
    getLocationFromName,
    getBranchFromName,
    addLocation,
    addBranch
}