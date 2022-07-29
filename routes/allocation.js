const express = require('express')
const router = express.Router()
const {
    test,
    addUserItem,
    removeUserItem,
    moveUserItem
} = require('../logic/allocation')

router.get('/', test)
router.put('/allocate', addUserItem)
router.put('/remove', removeUserItem)
router.put('/move', addUserItem)
router.route('*', (req, res)=>{
    res.status(404).json({"code":404, "message":'Resource not found'})
})

module.exports = router