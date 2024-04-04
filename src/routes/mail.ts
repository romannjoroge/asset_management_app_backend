import express from "express";
import getMailSubscriptionIDs from "../Mail/getMailSubscriptions.js";
import MyError from "../utility/myError.js";
import handleError from "../utility/handleError.js";
import { MyErrors2, Success2 } from "../utility/constants.js";
import { insertUserToMailingList } from "../Mail/insertUserToMailingList.js";
import checkIfAuthorized from "../../middleware/checkifAuthorized.js";
import { UserRoles } from "../Users/users.js";
import getUserMailSubscriptions from "../Mail/user-mail-subscriptions.js";

let router = express.Router();

router.get('/subscriptions', (req, res) => {
    getMailSubscriptionIDs().then(subscribtions => {
        return res.json(subscribtions);
    }).catch((err: MyError) => {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    })
});

router.post('/addUserToMail', checkIfAuthorized(UserRoles.REPORT_GEN), (req, res) => {
    let {
        userid,
        mailsubscriptionid
    } = req.body;

    userid = Number.parseInt(userid);
    mailsubscriptionid = Number.parseInt(mailsubscriptionid);

    insertUserToMailingList(userid, mailsubscriptionid).then(_ => {
        return res.json({message: Success2.ADDED_USER_MAIL});
    })
})

router.get('/userMailSubscriptions', (req, res) => {
 getUserMailSubscriptions().then(data => {
    return res.json(data)
 })
 .catch((err) => {
  let {errorMessage, errorCode} = handleError(err);
  return res.status(errorCode).json({message: errorMessage});
 }) 
}) 

router.get('*', (req, res) => {
    return res.status(404).json({message: MyErrors2.ROUTE_NOT_EXIST});
})

export default router;
