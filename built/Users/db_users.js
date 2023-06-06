const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";
const addUser = "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";
const getUsers = "SELECT username FROM User2";
const isUserAuthorized = "SELECT username FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1) AND username=$2";
const nameEmail = "SELECT username, email FROM User2";
const userRoles = "SELECT name FROM Role WHERE id IN (SELECT roleid FROM UserRole WHERE username=$1)";
const doesUserExist = "SELECT * FROM User2 WHERE email = $1 OR username = $2";
const addUserRole = "INSERT INTO UserRole VALUES($1, (SELECT id FROM Role WHERE name = $2));";
const doesUsernameExist = "SELECT * FROM User2 WHERE username=$1";
const getCompany = "SELECT companyName FROM User2 WHERE username=$1";
const getNumberOfUsers = "SELECT COUNT(*) AS noUsers FROM User2";
let userTable = {
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