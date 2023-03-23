const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";
const addUser = "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";
const getUsers = "SELECT username FROM User2";
const isUserAuthorized = "SELECT username FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1) AND username=$2"

let userTable = {
    checkIfUserInDB,
    addUser,
    getUsers,
    isUserAuthorized
}

export default userTable;