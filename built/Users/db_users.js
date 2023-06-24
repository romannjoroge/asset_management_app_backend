const checkIfUserInDB = "SELECT * FROM User2 WHERE username = $1 AND deleted = false";
const addUser = "INSERT INTO User2 (name, email, password, username, companyName,) VALUES ($1, $2, $3, $4, $5)";
const getUsers = "SELECT username FROM User2 WHERE deleted = false";
const isUserAuthorized = "SELECT username FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1) AND username=$2";
const nameEmail = "SELECT username, email FROM User2 WHERE deleted = false";
const userRoles = "SELECT name FROM Role WHERE id IN (SELECT roleid FROM UserRole WHERE username=$1)";
const doesUserExist = "SELECT * FROM User2 WHERE email = $1 OR username = $2 AND deleted = false";
const addUserRole = "INSERT INTO UserRole VALUES($1, (SELECT id FROM Role WHERE name = $2));";
const doesUsernameExist = "SELECT * FROM User2 WHERE username=$1 AND deleted = false";
const getCompany = "SELECT companyName FROM User2 WHERE username=$1 AND deleted = false";
const getNumberOfUsers = "SELECT COUNT(*) AS noUsers FROM User2 WHERE deleted = false";
const checkIfEmailIsTaken = "SELECT * FROM User2 WHERE email = $1 AND deleted = false";
const getRole = "SELECT * FROM Role WHERE name=$1 AND deleted = false";
const deleteUserRoles = "DELETE FROM UserRole WHERE username=$1";
const getNameEmail = "SELECT name, email FROM User2 WHERE username = $1 AND deleted = false";
const checkIfNameExists = "SELECT * FROM User2 WHERE name = $1 AND deleted = false";
const getNames = "SELECT name, username FROM User2 WHERE deleted = false";
const getName = "SELECT name FROM User2 WHERE username = $1 AND deleted = false";
let userTable = {
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
};
export default userTable;
//# sourceMappingURL=db_users.js.map