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

module.exports = router