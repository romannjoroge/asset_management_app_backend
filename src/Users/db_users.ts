const checkIfUserInDB = "SELECT * FROM User2 WHERE username = $1 AND deleted = false";
const checkIfUserIDExists = "SELECT * FROM User2 WHERE id = $1 AND deleted = false";
const addUser = "INSERT INTO User2 (name, email, password, username, companyName) VALUES ($1, $2, $3, $4, $5)";
const getUsers = "SELECT username FROM User2 WHERE deleted = false";
const isUserAuthorized = "SELECT * FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1 LIMIT 1) AND userid=$2";
const nameEmail = "SELECT username, email, name, id FROM User2 WHERE deleted = false";
const userRoles = "SELECT r.name FROM UserRole u JOIN Role r ON r.id = u.roleid WHERE u.userid = $1"
const doesUserExist = "SELECT * FROM User2 WHERE email = $1 OR username = $2 AND deleted = false"
const addUserRole = "INSERT INTO UserRole (userid, roleid) VALUES ($1, (SELECT id FROM Role WHERE name = $2 ORDER BY id DESC LIMIT 1));"
const doesUsernameExist = "SELECT * FROM User2 WHERE username=$1 AND deleted = false";
const getCompany = "SELECT companyName FROM User2 WHERE username=$1 AND deleted = false";
const getNumberOfUsers = "SELECT COUNT(*) AS noUsers FROM User2 WHERE deleted = false";
const checkIfEmailIsTaken = "SELECT * FROM User2 WHERE email = $1 AND deleted = false";
const getRole = "SELECT * FROM Role WHERE name=$1 AND deleted = false";
const deleteUserRoles = "DELETE FROM UserRole WHERE username=$1";
const getNameEmail = "SELECT name, email FROM User2 WHERE id = $1 AND deleted = false";
const checkIfNameExists = "SELECT * FROM User2 WHERE name = $1 AND deleted = false";
const getNames = "SELECT name, username FROM User2 WHERE deleted = false"
const getName = "SELECT name FROM User2 WHERE username = $1 AND deleted = false";
const addCompany = "INSERT INTO Company (name) VALUES ($1)";
const getLatestUserID = "SELECT id FROM User2 WHERE username = $1 ORDER BY id DESC LIMIT 1";
const giveUserAllRoles = "INSERT INTO UserRole (userid, roleid) VALUES ($1, (SELECT id FROM Role WHERE name = 'Company Administrator')), ($1, (SELECT id FROM Role WHERE name = 'User Manager')), ($1, (SELECT id FROM Role WHERE name = 'Asset Administrator')), ($1, (SELECT id FROM Role WHERE name = 'Asset Reconciler')) ,($1, (SELECT id FROM Role WHERE name = 'RFID Reader')), ($1, (SELECT id FROM Role WHERE name = 'Asset User')), ($1, (SELECT id FROM Role WHERE name = 'GatePass Authorizer'))";
const getUserDetails = "SELECT name, id FROM User2 WHERE deleted = false";
const getUserID = "SELECT id FROM User2 WHERE username = $1";
const getUsername = "SELECT username FROM User2 WHERE id = $1";

let userTable = {
    getUsername,
    getUserID,
    getUserDetails,
    checkIfUserIDExists,
    giveUserAllRoles,
    getLatestUserID,
    addCompany,
    getName,
    getNames,
    checkIfNameExists,
    getNameEmail,
    deleteUserRoles,
    getRole,
    checkIfEmailIsTaken,
    checkIfUserInDB,
    addUser,
    getUsers,
    isUserAuthorized,
    nameEmail,
    userRoles,
    doesUserExist,
    addUserRole,
    doesUsernameExist,
    getCompany,
    getNumberOfUsers
}

export default userTable;