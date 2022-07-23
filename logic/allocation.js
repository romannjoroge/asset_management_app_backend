function addUserItem (req, res){
    // Add code
    res.status(200).json({"success": true, 'message': 'addUserItem'})
}

function removeUserItem(req, res){
    // Add code
    res.status(200).json({"success": true, 'message': 'removeUserItem'})
}

function moveUserItem(req, res){
    res.status(200).json({"success": true, 'message': 'moveUserItem'})
}

function test(req, res){
    res.status(200).json({'success': true, 'message':'The routes are working atleast'})
}

module.exports = {
    test,
    addUserItem,
    removeUserItem,
    moveUserItem
}