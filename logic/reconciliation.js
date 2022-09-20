const utility = require('../utility/utility')
const pool = require('../db')
const reconciliation = require('../model/Reconciliation/reconciliation')

async function addItemReconciliation(item_id){
    // Make sure item_id is not empty
    if (!item_id){
        return(-1)  // Return -1 for an error
    }

    // Adds item to reconciliation table
    try{
        await pool.query(reconciliation.addItemReconciliation, [item_id, new Date().toLocaleString()])
    }catch(err){
        console.log(err)
        return (-1)
    }
    return(0)
}

async function removeItemReconciliation(item_id){
    // Make sure item_id is not empty
    if(!item_id){
        return(-1)
    }

    try{
        await pool.query(reconciliation.removeItemReconciliation, [item_id])
    }catch(err){
        return(-1)
    }

    return 0
}

module.exports = {
    addItemReconciliation,
    removeItemReconciliation
}

// console.log(new Date().toLocaleString()
// )