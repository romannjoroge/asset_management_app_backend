const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";
const addUser = "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";
const getUsers = "SELECT username FROM User2";

let userTable = {
    checkIfUserInDB,
    addUser,
    getUsers
}

export default userTable;