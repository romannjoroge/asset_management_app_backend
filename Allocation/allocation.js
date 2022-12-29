const utility = require('../utility/utility')
const allocation = require('../model/Allocation/allocation')
const item = require('../model/Assets/items')
const pool = require('../db')
const users = require('../model/Users/users')
const {addlog} = require('../logic/log')

async function addUserItem (req, res){
    // Get item_id and user_id
    let {
        item_id,
        username
    } = req.body

    let user_id;

    let items = [username, item_id]

    isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({"code":false, "message":'Details are null'})
    }

    // Verify username
    try{
        const result = await pool.query(users.getUserFromName, [username])
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result.rows[0]['user_id']
    }catch(err){
        console.log(err)
        return res.status(501).json({data:`Server couldn't verify if user ${username} exists`})
    }

    // Check that item_id is valid
    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} does not exist`, 'Allocating Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        // Allocate the item to a user
        await pool.query(allocation.allocate, [user_id, item_id])
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} has been allocated to user ${username}`, 'Allocating Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Item ${item_id} has been allocated to user ${username}`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server couldn't allocate item ${item_id} to user ${username}`, 'Allocating Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server couldn't allocate item ${item_id} to user ${username}`})
    }
}

async function removeUserItem(req, res){
    // Get item_id
    let {
        username,
        item_id
    } = req.body

    let user_id;
    
    // Make sure none are null
    if (utility.isAnyEmpty([username, item_id])){
        return res.status(404).json({data:"One of the items was empty"})
    }

    // Verify username
    try{
        const result = await pool.query(users.getUserFromName, [username])
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result.rows[0]['user_id']
    }catch(err){
        console.log(err)
        return res.status(501).json({data:`Server couldn't verify if user ${username} exists`})
    }

    try{
        // Checks if item_id exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} does not exist`, 'Unallocating Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            // Item with id item_id does not exist
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        // Go to entry of item_id and set user_id to null
        await pool.query(allocation.allocate, ['None', item_id])
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} has been removed from user`, 'Unallocating Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Item ${item_id} has been removed from user`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server couldn't unallocate item ${item_id}`, 'Unallocating Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server couldn't unallocate item ${item_id}`})
    } 
}

module.exports = {
    addUserItem,
    removeUserItem
}