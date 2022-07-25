// To start an app listening on port 5000 and have a /test route
const express = require('express')
app = express()
const testRoute = require('./routes/test')

app.use('/test', testRoute)

app.listen(4000, () => console.log('Server is listening on port 4000.....'))