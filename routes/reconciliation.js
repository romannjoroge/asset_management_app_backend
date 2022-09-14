const express = require('express')
const router = express.Router()

const {test} = require('../test/routes_test') 
// Test to see if the route is reachable
router.get('/', test)

router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

module.exports = router