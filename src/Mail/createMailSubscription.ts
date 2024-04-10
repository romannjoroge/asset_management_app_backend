import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export default async function createMailSubscription(subscription_name: string, description: string): Promise<void> {
    return new Promise((res, rej) => {
        let query = "INSERT INTO MailSubscriptions (name, description) VALUES ($1, $2);"
        pool.query(query, [subscription_name, description]).then(() => {
            return res();
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_CREATE_MAIL_SUBSCRIPTION));
        })
    });
}