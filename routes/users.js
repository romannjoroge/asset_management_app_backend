const express = require('express')
const router = express.Router()
const userFunctions = require('../logic/users')

router.get('/getUsers', userFunctions.getUsers)
router.post('/add', userFunctions.addUser)

router.route('*', (req, res) => {
    res.status(404).json({data:"Resource not found"})
})