const express = require('express')
const router = express.Router()
const {
    addCategory,
    removeCategory,
    updateCategory,
    getCategory,
    getCategories,
    getCategoryName
} = require('../logic/category')

const {test} = require('../test/routes_test') 
// Test to see if the route is reachable
router.get('/', test)

router.post('/add', addCategory)
router.put('/update', updateCategory)
router.delete('/remove', removeCategory)
router.get('/view', getCategories)
router.get('/view/:id', getCategory)
router.get('/categoryName', getCategoryName)
router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

module.exports = router