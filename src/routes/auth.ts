import express from 'express';
let router = express.Router();
import verifyAuthenticationDetails from '../Auth/verify_password.js';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';
import User from '../Users/users.js';
import Auth from '../Auth/auth.js';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

router.post('/sendDetails', (req, res) => {
    // Accepts username and password from the user
    const username = req.body.username;
    const password = req.body.password;

    // Checks if password username combo is correct 
    verifyAuthenticationDetails(username, password).then(isCorrect => {
        // If authentication details are not right
        if(!isCorrect) {
            // return indication that combo was wrong  
            return res.status(200).json({isCorrect: false});
        }

        // If correct return id of user and indication that details are correct
        User.getUserID(username).then(id => {
            return res.json({isCorrect: true, id})
        })
    }).catch((err: MyError) => {
        return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
    })
});

router.post('/generateOTP', (req, res) => {
    const userid = Number.parseInt(req.body.id);

    Auth.generateOTP(userid).then(otp => {
        // TO DO: Implement Send OTP to email
        console.log(`OTP is ${otp}`);
        return res.send("Done");
    }).catch((err: MyError) => {
        return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
    })
});

router.post('/verifyOTP', (req, res) => {
    // Get OTP entered by user and user id
    const userid = Number.parseInt(req.body.id);
    const otp = req.body.otp;

    // Verify if OTP is correct
    Auth.verifyOTP(userid, otp).then(isCorrect => {
        // If not correct return not correct
        if(!isCorrect) {
            return res.json({isCorrect: false});
        }

        // Get username of user to be returned in webtoken
        User.getUsername(userid).then(username => {
            // Send JWT token
            const token = JWT.sign({userid}, process.env.TOKEN_SECRET ?? "", {expiresIn:3600});
            return res.json({
                isCorrect: true,
                token, 
                username,
                user_id: userid
            });
        })
    })
})

export default router;