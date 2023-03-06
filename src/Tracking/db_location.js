let getLocation = "SELECT name FROM Location WHERE id = $1";

let locationTable = {
    getLocation: getLocation
}

export default locationTable;