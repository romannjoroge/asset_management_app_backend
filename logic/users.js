const pool = require('../../db')
const userStatements = require('../model/Users/users')
const utility = require('../utility/utility')

async function addUser(req, res) {
    // Get data from request body
    let {
        username,
        email,
        user_id
    } = req.body()

    // Verify that none of the info is empty
    if (utility.isAnyEmpty([username, email, user_id])){
        return res.status(404).json({data:"One of the entries was empty"})
    }

    try{
        // Verify if user already exists
        const result1 = await pool.query(userStatements.getUserFromName, [username])
        // If the result has rows it means the user already exists
        if (result1.rowCount > 0){
            return res.status(404).json({data:"User already in system"})
        }

        // Add the user since it does not exist
        await pool.query(userStatements.addUser, [user_id, email, username])
        res.status(201).json({data:"User added to system"})
    }catch(err){
        console.log(err)
        res.status(501).json({data:"Server could not add user"})
    }
}

async function getUsers(req, res){
    // Returns all the users usernames in system
    try{
        const result = await pool.query(userStatements.getUser)
        // If it is empty return an error saying there are no users
        if (result.rowCount == 0){
            return res.status(404).json({data:"No users in system"})
        }
        res.status(200).json({data:result.rows})
    }catch(error){
        console.log(err)
        res.status(501).json({data:"Couldn't get users from server"})
    }
}

module.exports = {
    addUser,
    getUsers
}