const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";
const addUser = "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";

let userTable = {
    checkIfUserInDB,
    addUser
}

export default userTable;