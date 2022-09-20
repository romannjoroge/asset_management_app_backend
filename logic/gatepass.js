const utility = require('../utility/utility')
const pool = require('../db')
const gatepass = require('../model/GatePass/gatepass')
const item = require('../model/Assets/items')
const location = require('../model/Tracking/location')
const {addlog} = require('../logic/log')
const users = require('../model/Users/users')

async function authorize (req, res){
    // Getting required info
    let {
        branch_id,
        location_name,
        item_id,
        reason,
        username,
        date,
        num_days
    } = req.body

    // Initializing locationID
    let location_id;
    let user_id;

    // Validating that info isn't null
    items = [branch_id, location_name, item_id, reason, username, date, num_days]
    isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        return res.status(404).json({data:'One of the fields are empty'})
    }

    // Converting data to appropriate types
    num_days = parseInt(num_days)
    branch_id = parseInt(branch_id)

    try{
        // Checking if username exists
        const result4 = await pool.query(users.getUserFromName, [username])
        if (result4.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result4.rows[0]['user_id']

        // Checking if an entry for item exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} does not exist`, 'Authorizing Gatepass')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            // Returns an error if item doesn't exist
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }

        // Checking if an entry for location exists
        const result2 = await pool.query(location.getLocationFromName, [location_name, branch_id])
        if (result2.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Location ${location_name} does not exist`, 'Authorizing Gatepass')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            // Returns an error if location doesn't exist
            return res.status(404).json({data:`Location ${location_name} does not exist`})
        }
        location_id = result2.rows[0]['location_id']

        // Checking if branch exists
        const result3 = await pool.query(location.getBranch, [branch_id])
        // If result3 is empty the branch does not exist
        if (result3.rowCount == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Branch ${branch_id} does not exist`, 'Authorizing Gatepass')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Branch ${branch_id} does not exist`})
        }



        // Adding gatepass entry
        await pool.query(gatepass.authorize, [item_id, user_id, location_id, reason, date, num_days])
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} has been authorized to leave`, 'Authorizing Gatepass')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(201).json({data:`Item ${item_id} has been authorized to leave`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server couldn't authorize item ${item_id} to leave`, 'Authorizing Gatepass')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server couldn't authorize item ${item_id} to leave`})
    }
}

// function leaveStatus (req, res){
//     // Add code
// }

async function historyAllItems (req, res){
    // Send details of all items
    try{
        const result = await pool.query(gatepass.historyAllItems)
        res.status(200).json({data:result.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function historyItem (req, res){
    // Get item_id from path
    let item_id = req.params.id

    // Check if its null
    if (!item_id){
        return res.status(404).json({data:'Item id cannot be null'})
    }

    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        const result2 = await pool.query(gatepass.historyItem, [item_id])
        res.status(200).json({data:result2.rows})
    }catch(error){
        console.log(error)
        res.status(501).json({data:`Server couldn't get gatepass history of ${item_id}`})
    }
}

module.exports = {
    authorize,
    // leaveStatus,
    historyAllItems,
    historyItem
}