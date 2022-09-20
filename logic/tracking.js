const pool = require('../db')
const location = require('../model/Tracking/location')
const utility = require('../utility/utility')
const item = require('../model/Assets/items')
const users = require('../model/Users/users')
const {addlog} = require('../logic/log')

async function moveItem(req, res){
    // Get details
    let {
        username,
        location_name,
        branch_id,
        item_id
    } = req.body

    // Initializing location_id
    let location_id;
    let user_id;

    // Validate them
    // Changing items to appropriate type
    branch_id = parseInt(branch_id)


    // Checking if any item is empty
    let items = [username, location_name, item_id, branch_id]
    const isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({data:'One of the items is empty'})
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
        // Checking if an entry for item exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} does not exist`, 'Moving Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            // Returns an error if item doesn't exist
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        // Checking if an entry for branch exists
        const result2 = await pool.query(location.getBranch, [branch_id])
        if (result2.rows.length == 0){
            // Returns an error if location doesn't exist
            if (await addlog(user_id, new Date().toLocaleString(), `Branch ${branch_id} does not exist`, 'Moving Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Branch ${branch_id} does not exist`})
        }
        // Checking if an entry for location exists
        const result3 = await pool.query(location.getLocationFromName, [location_name, branch_id])
        if (result3.rows.length == 0){
            // Returns an error if location doesn't exist
            if (await addlog(user_id, new Date().toLocaleString(), `Location ${location_name} does not exist`, 'Moving Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Location ${location_name} does not exist`})
        }
        location_id = result3.rows[0]['location_id']
        // Changing the location of the item
        pool.query(location.moveItem, [location_id, item_id])
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} has been moved to ${location_name}`, 'Moving Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Item ${item_id} has been moved to ${location_name}`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server could not move item ${item_id}`, 'Moving Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server could not move item ${item_id}`})
    }
}

async function displayItems(req, res){
    // Run query
    try{
        const results = await pool.query(location.displayItems)
        res.status(200).json({data:results.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function displayItem(req, res){
    // Validate item_id
    let item_id = req.params.id 
    item_id = parseInt(item_id)
    if (!item_id){
        res.status(404).json({data:'Item ID can not be null'})
    }
    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({data:'Item does not exist'})
        }
        const result2 = await pool.query(location.displayItem, [item_id])
        return res.status(200).json({data:result2.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function getLocationFromBranch(req, res){
    // Get branch ID from params
    let id = req.params.id

    // Convert to a number
    id = parseInt(id)

    // Send locations from server
    try{
        const result = await pool.query(location.getLocationNames, [id])
        // If result is empty send an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`There are no locations in branch ${id}`})
        }
        res.status(200).json({data: result.rows})
    }catch(err){
        console.log(err)
        res.status(501).json({data:`Server couldn't get locations in branch ${id}`})
    }
}

async function getBranchNames(req, res){
    // Return branch names and ids from server
    try {
        const result = await pool.query(location.getBranches)
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:"No branches in system"})
        }
        res.status(200).json({data: result.rows})
    }catch(error){
        console.log(error)
        res.status(501).json({data: "Server had trouble getting branches try again"})
    }
}

async function addLocation(req, res){
    // Adds a location to the system
    
    // Getting location_name and branch of location from server
    let {
        username,
        location_name,
        branch_name
    } = req.body

    let branch_id;
    let user_id;

    // Making sure nothing is empty
    if (utility.isAnyEmpty([username, location_name, branch_name])){
        // If true something was empty and an error should be raised
        return res.status(404).json({data: "One of the details was empty"})
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

    // Making sure branch exists
    try{
        const result = await pool.query(location.getBranchFromName, [branch_name])
        // If result is empty then the branch does not exist
        if (result.rowCount == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Branch ${branch_name} does not exist`, 'Adding Location')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Branch ${branch_name} does not exist`})
        }
        // Else store branch_id
        branch_id = result.rows[0]['branch_id']

        // Make sure that branch location combination does not exist
        const result2 = await pool.query(location.getLocationFromName, [location_name, branch_id])
        // If result has something then means that combination exists
        if (result2.rowCount > 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Location ${location_name} already exists in branch ${branch_name}`, 'Adding Location')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Location ${location_name} already exists in branch ${branch_name}`})
        }

        // Add location
        await pool.query(location.addLocation, [branch_id, location_name])
        if (await addlog(user_id, new Date().toLocaleString(), `Location ${location_name} has been created`, 'Adding Location')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data: `Location ${location_name} has been created`})
    }catch(err){
        console.log(err)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had trouble adding ${location_name} please try again`, 'Adding Location')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server had trouble adding ${location_name} please try again`})
    }
}

async function addBranch(req, res){
    // Get branch details
    let {
        username,
        city,
        name
    } = req.body

    let user_id;

    // Make sure non is null
    if(utility.isAnyEmpty([username, city, name])){
        // Raise error if any is empty
        return res.status(404).json({data:"One of the details is empty"})
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

    // Make sure name is not used
    try {
        const result = await pool.query(location.getBranchFromName, [name])
        // If result is not empty then name exists and error should be sent
        if (result.rowCount > 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Branch ${branch_name} already exists`, 'Adding Branch')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Branch ${branch_name} already exists`})
        }

        // Add branch
        await pool.query(location.addBranch, [city, name])
        if (await addlog(user_id, new Date().toLocaleString(), `Branch ${name} has been added`, 'Adding Branch')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Branch ${name} has been added`})
    }catch(err){
        console.log(err)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had trouble adding branch ${name}`, 'Adding Branch')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server had trouble adding branch ${name}`})
    }
}

module.exports = {
    moveItem,
    displayItem,
    displayItems,
    getLocationFromBranch,
    getBranchNames,
    addLocation,
    addBranch
}