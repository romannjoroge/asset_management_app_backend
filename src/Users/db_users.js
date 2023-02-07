const checkIfUserInDB = "SELECT fname FROM User2 WHERE username = $1";

module.exports = {
    checkIfUserInDB,
}