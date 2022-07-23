const express = require('express')
const router = express.Router()
const {
    test,
    addUserItem,
    removeUserItem,
    moveUserItem
} = require('../logic/allocation')

router.get('/', test)
router.post('/allocate', addUserItem)
router.delete('/remove', removeUserItem)
router.put('/move', moveUserItem)

module.exports = router