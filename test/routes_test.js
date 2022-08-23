function test(req, res){
    res.status(200).json({'success': true, 'message':'The routes are working atleast'})
}

module.exports = {
    test
}