const express = require('express')
const router = express.Router()
const{
    moveItem,
    displayItem,
    displayItems,
    getLocationFromBranch,
    getBranchNames,
    addLocation,
    addBranch
} = require('../logic/tracking')

const {test} = require('../test/routes_test') 
// Test to see if the route is reachable
router.get('/', test)

router.route('/move').get().put(moveItem)
router.route('/display').get(displayItems)
router.get('/display/:id', displayItem)
router.get('/locationFromBranch/:id', getLocationFromBranch)
router.get('/getBranchNames', getBranchNames)
router.post('/add/location', addLocation)
router.post('/add/branch', addBranch)

router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

module.exports = router
