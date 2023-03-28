const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";
const addUser = "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";
const getUsers = "SELECT username FROM User2";
const isUserAuthorized = "SELECT username FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1) AND username=$2";
const nameEmail = "SELECT username, email FROM User2";
const userRoles = "SELECT name FROM Role WHERE id IN (SELECT roleid FROM UserRole WHERE username=$1)"

let userTable = {
    checkIfUserInDB,
    addUser,
    getUsers,
    isUserAuthorized,
    nameEmail,
    userRoles
}

export default userTable;