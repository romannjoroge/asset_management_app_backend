const utility = require('../utility/utility')
const pool = require('../db')
const log = require('../model/Log/log')

async function addlog(user_id, time_occur, event, action){
    // Verifying that none of the details are empty
    if (utility.isAnyEmpty([user_id, time_occur, event, action])){
        return(-1)  // Indicates an error
    }

    // Adding entry to database
    try{
        await pool.query(log.addLog, [user_id, time_occur, event, action])
    }catch(err){
        console.log(err)
        return(-1)
    }
    return 0  // Indicates that no errors occured
}

module.exports = {
    addlog
}