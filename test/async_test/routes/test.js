// A route that executes a function that print from 1 to 100
const router = require('express').Router()
const {countTo100} = require('../logic/test')

router.get('/', countTo100)
router.get('/home', (req, res)=>{
    res.send('Hello World!')
})

module.exports = router