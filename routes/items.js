const express = require('express')
const router = express.Router()
const {
    addItem,
    removeItem,
    updateItem,
    getItem,
    getItems
} = require('../logic/items')

const {test} = require('../test/routes_test') 
// Test to see if the route is reachable
router.get('/', test)
router.post('/add', addItem)
router.put('/update', updateItem)
router.delete('/remove', removeItem)
router.get('/view', getItems)
router.get('/view/:id', getItem)
router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

module.exports = router