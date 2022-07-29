const utility = require('../utility/utility')
const pool = require('../db')
const gatepass = require('../model/GatePass/gatepass')
const item = require('../model/Assets/items')
const location = require('../model/Tracking/location')

async function authorize (req, res){
    // Getting required info
    let {
        item_id,
        user_id,
        original_location_id,
        reason,
        leaving_time,
        days_gone
    } = req.body

    // Validating that info isn't null
    items = [item_id, user_id, original_location_id, reason, leaving_time, days_gone]
    isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({"code":404, "message":'Details are missing'})
    }

    // Converting data to appropriate types
    item_id = parseInt(item_id)
    original_location_id = parseInt(original_location_id)
    user_id = parseInt(user_id)
    days_gone = parseInt(days_gone)

    try{
        // Checking if an entry for item exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            // Returns an error if item doesn't exist
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        // Checking if an entry for location exists
        const result2 = await pool.query(location.getLocation, [original_location_id])
        if (result2.rows.length == 0){
            // Returns an error if location doesn't exist
            return res.status(404).json({"code":404, "message":'Location does not exist'})
        }
        // Adding gatepass entry
        await pool.query(gatepass.authorize, items)
        return res.status(201).json({"success":true, "message":'Item added to gatepass table'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

// function leaveStatus (req, res){
//     // Add code
// }

async function historyAllItems (req, res){
    // Send details of all items
    try{
        const result = await pool.query(gatepass.historyAllItems)
        res.status(200).json({"success":true, "message":'Data sent', "data":result.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function historyItem (req, res){
    // Get item_id from path
    let item_id = req.params.id
    // Convert it to an int
    item_id = parseInt(item_id)
    // Check if its null
    if (!item_id){
        return res.status(404).json({"code":404, "message":'Item id cannot be null'})
    }

    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        const result2 = await pool.query(gatepass.historyItem, [item_id])
        res.status(200).json({"success":true, "message":'Data succesfully sent', "data":result2.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

module.exports = {
    authorize,
    // leaveStatus,
    historyAllItems,
    historyItem
}