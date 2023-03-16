import express from 'express';
const app = express();
import cors from 'cors';
import multer from 'multer'; // Deals with file upload
const upload = multer({dest: 'attachments/'});  // Specifies path to store uploaded attachments
import dotenv from 'dotenv';
dotenv.config()  // Brings varaibles from .env file

// // Auth0 stuff
// const { auth } = require('express-openid-connect');  // Allows us to communicate with openid compliant services
// // Gives settings for configuring auth0
// const config = {
//     authRequired: false,
//     auth0Logout: true,
//     secret: process.env.SECRET,
//     baseURL: process.env.BASEURL,
//     clientID: process.env.CLIENTID,
//     issuerBaseURL: process.env.ISSUER
//   };
// // auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));


// Reading JSON data from forms and JS respectively
app.use(cors());
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Importing routes
import allocate from './routes/allocation.js';
import items from './routes/items.js';
import category from './routes/category.js';
import tracking from './routes/tracking.js';
import gatepass from './routes/gatepass.js';
import reports from './routes/reports.js';
import users from './routes/users.js'

// Routers to use for different modules
app.use('/allocation', allocate)
app.use('/assets/items', items)
app.use('/assets/category', category)
app.use('/tracking', tracking)
app.use('/gatepass', gatepass)
app.use('/reports', reports)
app.use('/users', users)

app.get('/', (req, res)=>{
    console.log(req.oidc.isAuthenticated())
    res.status(200).json({success: true, msg: 'Secured resource'})
})

app.get('/assets', (req, res)=>{
    res.status(200).json({'success':true, 'data':'To Be Determined'})
})

app.route('*', (req, res)=>{
    res.status(404).json({'code':404, 'message':'Resource not found'})
})


app.listen(4000, ()=>{
    console.log('Server is listening on port 4000..')
})