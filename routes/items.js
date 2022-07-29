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
router.get('/view/:id', getItem)
router.route('*', (req, res)=>{
    res.status(404).json({"code":404, "message":'Resource not found'})
})

module.exports = router