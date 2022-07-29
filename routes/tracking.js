const express = require('express')
const router = express.Router()
const{
    moveItem,
    displayItem,
    displayItems
} = require('../logic/tracking')

router.get('/')
router.route('/move').get().put(moveItem)
router.route('/display').get(displayItems)
router.get('/display/:id', displayItem)
router.route('*', (req, res)=>{
    res.status(404).json({"code":404, "message":'Resource not found'})
})

module.exports = router
