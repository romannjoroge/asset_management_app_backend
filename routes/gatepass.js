const express = require('express')
const router = express.Router()
const {
    authorize,
    leaveStatus,
    historyAllItems,
    historyItem
} = require('../logic/gatepass')

router.get('/')
router.route('/authorize').get().post(authorize)
router.route('/leave').put(leaveStatus)
router.get('/history', historyAllItems)
router.get('/history/:id', historyItem)
router.route('*', (req, res)=>{
    res.status(404).json({"code":404, "message":'Resource not found'})
})

module.exports = router