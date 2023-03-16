let getLocation = "SELECT name FROM Location WHERE id = $1";
let getLocations = "SELECT name, id FROM Location"

let locationTable = {
    getLocation,
    getLocations
}

export default locationTable;