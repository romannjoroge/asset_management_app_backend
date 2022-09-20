const addItemReconciliation = 'INSERT INTO item_reconciliation(item_id, time_occur) VALUES($1, $2)'
const removeItemReconciliation = 'DELETE FROM item_reconciliation WHERE item_id=$1'

module.exports = {
    addItemReconciliation,
    removeItemReconciliation
}