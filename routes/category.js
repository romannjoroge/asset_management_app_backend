const express = require('express')
const router = express.Router()
const {
    addCategory,
    removeCategory,
    updateCategory,
    getCategory,
    getCategories
} = require('../logic/category')

router.get('/')
router.post('/add', addCategory)
router.put('/update', updateCategory)
router.delete('/remove', removeCategory)
router.get('/view', getCategories)
router.get('/:id', getCategory)

module.exports = router