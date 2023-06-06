export default userTable;
declare namespace userTable {
    export { checkIfUserInDB };
    export { addUser };
    export { getUsers };
    export { isUserAuthorized };
    export { nameEmail };
    export { userRoles };
    export { doesUserExist };
    export { addUserRole };
    export { doesUsernameExist };
    export { getCompany };
    export { getNumberOfUsers };
}
declare const checkIfUserInDB: "SELECT fname FROM User2 WHERE username = $1";
declare const addUser: "INSERT INTO User2 VALUES ($1, $2, $3, $4, $5, $6)";
declare const getUsers: "SELECT username FROM User2";
declare const isUserAuthorized: "SELECT username FROM UserRole WHERE roleID=(SELECT id FROM Role WHERE name=$1) AND username=$2";
declare const nameEmail: "SELECT username, email FROM User2";
declare const userRoles: "SELECT name FROM Role WHERE id IN (SELECT roleid FROM UserRole WHERE username=$1)";
declare const doesUserExist: "SELECT * FROM User2 WHERE email = $1 OR username = $2";
declare const addUserRole: "INSERT INTO UserRole VALUES($1, (SELECT id FROM Role WHERE name = $2));";
declare const doesUsernameExist: "SELECT * FROM User2 WHERE username=$1";
declare const getCompany: "SELECT companyName FROM User2 WHERE username=$1";
declare const getNumberOfUsers: "SELECT COUNT(*) AS noUsers FROM User2";
