const express = require('express')
const router = express.Router()
const {
    addItem,
    removeItem,
    updateItem,
    getItem,
    getItems
} = require('../logic/items')

router.get('/')
router.post('/add', addItem)
router.put('/update', updateItem)
router.delete('/remove', removeItem)
router.get('/view', getItems)
router.get('/:id', getItem)

module.exports = router