var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
let router = express.Router();
import verifyAuthenticationDetails from '../Auth/verify_password.js';
import { MyErrors2 } from '../utility/constants.js';
import User from '../Users/users.js';
import Auth from '../Auth/auth.js';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import Mail from '../Mail/mail.js';
import { Lama } from '../Lama/lama.js';
import handleError from '../utility/handleError.js';
dotenv.config();
router.post('/sendDetails', (req, res) => {
    // Accepts username and password from the user
    const username = req.body.username;
    const password = req.body.password;
    // Checks if password username combo is correct 
    verifyAuthenticationDetails(username, password).then(isCorrect => {
        // If authentication details are not right
        if (!isCorrect) {
            // return indication that combo was wrong  
            return res.status(200).json({ isCorrect: false });
        }
        // If correct return id of user and indication that details are correct
        User.getUserID(username).then(id => {
            return res.json({ isCorrect: true, id });
        });
    }).catch((err) => {
        return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
    });
});
router.post('/generateOTP', (req, res) => {
    const userid = Number.parseInt(req.body.id);
    Auth.generateOTP(userid).then(otp => {
        // Send message to users email with OTP
        // Get email of user
        User.getEmail(userid).then(email => {
            // Send email
            const emailBody = `
            <p>Hi ${email}</p>
            <p>We received your request for a single-use code to use with your Extreme Wireless Asset Management account.</p>
            <p>Your single-use code is: ${otp}</p>
            <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
            <p>Thanks,</p>
            <p>The Extreme Wireless Asset Management account team</p>
            `;
            const from = "Extreme Wireless Asset Management <support@extremewireless.co.ke>";
            const to = email;
            const subject = "Your Single Use Code";
            Mail.sendMail(emailBody, from, to, subject).then((_) => {
                return res.send("Done");
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
    });
});
router.post('/verifyOTP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get OTP entered by user and user id
    const userid = Number.parseInt(req.body.id);
    const otp = req.body.otp;
    try {
        let isCorrect = yield Auth.verifyOTP(userid, otp);
        if (!isCorrect) {
            return res.json({ isCorrect: false });
        }
        let username = yield User.getUsername(userid);
        let company = yield User.getCompanyName(userid);
        let settingsStore = yield Lama.init("settings");
        let timeout = yield settingsStore.get("timeout");
        let expirationTime;
        if (timeout) {
            expirationTime = Number.parseInt(timeout) * 60;
        }
        else {
            expirationTime = 3600;
        }
        const token = JWT.sign({ id: userid }, (_a = process.env.TOKEN_SECRET) !== null && _a !== void 0 ? _a : "", { expiresIn: expirationTime });
        return res.json({
            isCorrect: true,
            token,
            username,
            user_id: userid,
            expirationTime,
            company: company
        });
    }
    catch (err) {
        let { errorCode, errorMessage } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
    }
}));
export default router;
//# sourceMappingURL=auth.js.map