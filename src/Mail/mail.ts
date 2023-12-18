import { createTransport } from "nodemailer";
import dotenv from 'dotenv';
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
dotenv.config()

export default class Mail {
    static #transport = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });

    static sendMail(html: string, from: string, to: string, subject: string): Promise<void> {
        return new Promise((res, rej) => {
            this.#transport.sendMail({
                from,
                to,
                subject,
                html
            }).then(info => {
                return res();
            }).catch((err: any) => {
                console.log(err)
                return rej(new MyError(MyErrors2.NOT_SEND_MAIL))
            })
        });
    }
}