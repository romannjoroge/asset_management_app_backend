import express from 'express';
const app = express();
import cors from 'cors';
import multer from 'multer'; // Deals with file upload
const upload = multer({ dest: 'attachments/' });  // Specifies path to store uploaded attachments
import dotenv from 'dotenv';
dotenv.config()  // Brings varaibles from .env file
import { body, validationResult } from 'express-validator'
import pool from './db2.js';
import { Errors } from './utility/constants.js';
import bcrypt from 'bcrypt';
import userTable from './src/Users/db_users.js';
import JWT from 'jsonwebtoken';

// Reading JSON data from forms and JS respectively
app.use(cors());
app.use(express.urlencoded({ extended: false }))
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

app.get('/', (req, res) => {
    console.log(req.oidc.isAuthenticated())
    res.status(200).json({ success: true, msg: 'Secured resource' })
})

app.get('/assets', (req, res) => {
    res.status(200).json({ 'success': true, 'data': 'To Be Determined' })
})

app.route('*', (req, res) => {
    res.status(404).json({ 'code': 404, 'message': 'Resource not found' })
})

app.post('/signup', 
        body('password', "Password Should Be At Least 8 characters long").isLength({min: 8}), 
        body('email', "Enter a Valid Email").isEmail(),
        (req, res) => {
    // Get details from user
    let { fname,
        lname,
        email,
        password,
        username,
        companyName, } = req.body;

    // Validate details
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // Return errors
        return res.status(404).json({
            errors: errors.array()
        })
    }

    // Check if username already exists
    pool.query("SELECT username, email FROM User2 WHERE username=$1", [username]).then(data => {
        // If user exists throw error
        if(data.rowCount > 0) {
            return res.status(404).json({
                errors: [
                    {
                        msg: Errors[24],
                    }
                ]
            })
        }

        // Check if email exists
        pool.query("SELECT username FROM User2 WHERE email=$1", [email]).then(data => {
            // If email exists throw error
            if(data.rowCount > 0) {
                return res.status(404).json({
                    errors: [
                        {
                            msg: Errors[25],
                        }
                    ]
                })
            }

            // Hash the password
            bcrypt.hash(password, 10).then(hashedPasswd => {
                console.log(hashedPasswd.length);
                // Store user
                pool.query(userTable.addUser, [fname, lname, email, hashedPasswd, username, companyName]).then(_ => {
                    // Send JWT Token
                    const token = JWT.sign({username}, process.env.TOKEN_SECRET, {expiresIn:3600});
                    return res.status(200).json({token});
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        errors: [
                            {
                                msg: Errors[9]
                            }
                        ]
                    });
                });
            })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                errors: [
                    {
                        msg: Errors[9]
                    }
                ]
            });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            errors: [
                {
                    msg: Errors[9]
                }
            ]
        });
    });
});

app.listen(4000, () => {
    console.log('Server is listening on port 4000..')
})