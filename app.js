import express from 'express';
const app = express();
import cors from 'cors';
import multer from 'multer'; // Deals with file upload
const upload = multer({ dest: 'attachments/' });  // Specifies path to store uploaded attachments
import dotenv from 'dotenv';
dotenv.config()  // Brings varaibles from .env file
import { body, validationResult } from 'express-validator'
import pool from './db2.js';
import {Errors, MyErrors2}  from './built/utility/constants.js';
import bcrypt from 'bcrypt';
import userTable from './built/Users/db_users.js';
import JWT from 'jsonwebtoken';
import expressWs from 'express-ws'

// Cron Jobs
import "./built/Reports/report-cron-jobs.js";
var ExpressWs = expressWs(app);

// Reading JSON data from forms and JS respectively
app.use(cors({
    credentials: true,
    origin: '*'
}));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Importing routes
import tags from './built/routes/tags.js';
import auth from './built/routes/auth.js';
import deleteRoute from './built/routes/delete.js';
import items from './built/routes/items.js';
import category from './built/routes/category.js';
import tracking from './built/routes/tracking.js';
import gatepass from './built/routes/gatepass.js';
import reports from './built/routes/reports.js';
import users from './built/routes/users.js';
import mail from './built/routes/mail.js';
// import importModule from './built/routes/import.js';
import checkifAuthenticated from './middleware/checkifAuthenticated.js';
import checkifAuthorized from './middleware/checkifAuthorized.js';
import { getAssetsLeavingLocationAndIfAuthorized } from './built/Tracking/movements.js';

// Routers to use for different modules
app.use('/auth', auth);
app.use('/assets/items', checkifAuthenticated, items)
app.use('/assets/category', checkifAuthenticated, checkifAuthorized('Asset Administrator'), category)
app.use('/tracking', checkifAuthenticated, tracking)
app.use('/gatepass', checkifAuthenticated, gatepass)
app.use('/reports',  checkifAuthenticated, reports)
app.use('/users', checkifAuthenticated, users)
app.use('/delete', checkifAuthenticated, deleteRoute);
app.use('/mail', checkifAuthenticated, mail);

// app.use('/import', importModule);
app.use('/tags', tags);

app.get('/', (req, res) => {
    res.status(200).json({ success: true, msg: 'Secured resource' })
})

app.get('/assets', (req, res) => {
    res.status(200).json({ 'success': true, 'data': 'To Be Determined' })
})

app.route('*', (req, res) => {
    res.status(404).json({ 'code': 404, 'message': 'Resource not found' })
})

app.get('/test', (req, res) => {
    res.send("Can Reach System");
})

app.post('/signup', 
        body('password', "Password Should Be At Least 8 characters long").isLength({min: 8}), 
        body('email', "Enter a Valid Email").isEmail(),
        (req, res) => {
    // Get details from user
    let { name,
        email,
        password,
        username,
        company, } = req.body;

    

    // Validate details
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // Return errors
        return res.status(400).json({
            errors: errors.array()
        })
    }

    // Check if username already exists
    pool.query("SELECT username, email FROM User2 WHERE username=$1", [username]).then(data => {
        // If user exists throw error
        if(data.rowCount > 0) {
            return res.status(400).json({msg: Errors[24],})
        }

        // Check if email exists
        pool.query("SELECT username FROM User2 WHERE email=$1", [email]).then(data => {
            // If email exists throw error
            if(data.rowCount > 0) {
                return res.status(400).json({msg: Errors[25],})
            }

            // Check if the company already exists
            pool.query("SELECT * FROM Company WHERE name = $1", [company]).then(data => {
                // If something is returned company exists and error should be thrown
                if(data.rowCount > 0) {
                    return res.status(400).json({msg: MyErrors2['COMPANY_EXISTS']})
                }

                // Add the company
                pool.query(userTable.addCompany, [company]).then(_ => {
                    // Hash the password
                    bcrypt.hash(password, 10).then(hashedPasswd => {
                        // Store user
                        pool.query(userTable.addUser, [name, email, hashedPasswd, username, company]).then(_ => {
                            // Get user ID
                            pool.query(userTable.getLatestUserID, [username]).then(data => {
                                if (data.rowCount <= 0) {
                                    return res.status(404).json({msg: MyErrors2['NOT_CREATE_COMPANY']})
                                }

                                let id = data.rows[0].id
                                // Give the creator of the company all roles
                                pool.query(userTable.giveUserAllRoles, [id]).then(_ => {
                                    // Send JWT Token
                                    const token = JWT.sign({id}, process.env.TOKEN_SECRET, {expiresIn:3600});
                                    return res.status(200).json({token, username, id});
                                })
                            })
                        }).catch(err => {
                            console.log(err);
                            return res.status(500).json({msg: Errors[9]});
                        });
                    })
                })
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

app.post('/login', (req, res) => {
    // Get Details From Client
    let {username, password} = req.body;

    // Get User From Username
    pool.query("SELECT password, id, companyname FROM User2 WHERE username=$1", [username]).then(data => {
        // Return an error if user does not exist
        if(data.rowCount <= 0) {
            return res.status(400).json({message:Errors[26]});
        }

        const encryptedPassword = data.rows[0].password;
        const companyName = data.rows[0].companyname;
        // Compare given password to that stored in database
        bcrypt.compare(password, encryptedPassword).then(isSame => {
            // Return an error if passwords are not the same
            if(!isSame) {
                return res.status(400).json({message:Errors[26]});
            }

            let id = data.rows[0].id;
            // Send JWT token
            const token = JWT.sign({id}, process.env.TOKEN_SECRET, {expiresIn:3600});
            return res.json({
                token, 
                username,
                user_id: id,
                company: companyName
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({message:Errors[9]});
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({message:Errors[9]});
    });
});


app.on('upgrade', (request, socket, head) => {
    console.log("Connection Upgraded");
});

const port = 4500;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}..`)
})