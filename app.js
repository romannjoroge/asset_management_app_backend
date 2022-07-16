const express = require('express')
const app = express()
const {jwtCheck} = require('./logic/authentication')

// Log in with auth0
app.use(jwtCheck);

// Reading JSON data from forms and JS respectively
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', (req, res)=>{
    res.status(200).json({success: true, msg: 'Secured resource'})
})


app.listen(5000, ()=>{
    console.log('Server is listening on port 5000..')
})