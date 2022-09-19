const addUser = 'INSERT INTO Users(user_id, email, username) VALUES($1, $2, $3)'
const getUser = 'SELECT username FROM Users'
const getUserFromName = 'SELECT * FROM Users WHERE username=$1'

module.exports = {
    addUser,
    getUser,
    getUserFromName
}