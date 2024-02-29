import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export function insertUserToMailingList(userid: number, subscriptionid: number): Promise<void> {
    return new Promise((res, rej) => {
        let query = "INSERT INTO MailingList(userid, mailsubscriptionid) VALUES($1, $2)";

        pool.query(query, [userid, subscriptionid]).then((_: void) => {
            return res();
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_ADD_USER_MAILING_LIST));
        })
    });
}