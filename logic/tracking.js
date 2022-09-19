const pool = require('../db')
const location = require('../model/Tracking/location')
const utility = require('../utility/utility')
const item = require('../model/Assets/items')

async function moveItem(req, res){
    // Get details
    let {
        location_name,
        branch_id,
        item_id
    } = req.body

    // Initializing location_id
    let location_id;

    // Validate them
    // Changing items to appropriate type
    branch_id = parseInt(branch_id)


    // Checking if any item is empty
    items = [location_name, item_id, branch_id]
    const isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({data:'One of the items is empty'})
    }
    
    try{
        // Checking if an entry for item exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            // Returns an error if item doesn't exist
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        // Checking if an entry for branch exists
        const result2 = await pool.query(location.getBranch, [branch_id])
        if (result2.rows.length == 0){
            // Returns an error if location doesn't exist
            return res.status(404).json({data:`Location ${location_name} does not exist`})
        }
        // Checking if an entry for location exists
        const result3 = await pool.query(location.getLocationFromName, [branch_id, location_name])
        if (result3.rows.length == 0){
            // Returns an error if location doesn't exist
            return res.status(404).json({data:`Location ${location_name} does not exist`})
        }
        location_id = result3.rows[0]['location_id']
        // Changing the location of the item
        pool.query(location.moveItem, [location_id, item_id])
        res.status(201).json({data:`Item ${item_id} has been moved to ${location_name}`})
    }catch(error){
        console.log(error)
        res.status(404).json({data:`Server could not move item ${item_id}`})
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

module.exports = {
    moveItem,
    displayItem,
    displayItems,
    getLocationFromBranch,
    getBranchNames
}