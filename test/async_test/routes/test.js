// A route that executes a function that print from 1 to 100
const router = require('express').Router()
const items = require('../logic/test')

router.get('/', countTo100)
router.get('/home', (req, res)=>{
    res.send('Hello World!')
})
router.get('/items', items.getAllItems)

module.exports = router