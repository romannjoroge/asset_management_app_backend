var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Mail_transport;
import { createTransport } from "nodemailer";
import dotenv from 'dotenv';
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
dotenv.config();
class Mail {
    static sendMail(html, from, to, subject) {
        return new Promise((res, rej) => {
            __classPrivateFieldGet(this, _a, "f", _Mail_transport).sendMail({
                from,
                to,
                subject,
                html
            }).then(info => {
                return res();
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_SEND_MAIL));
            });
        });
    }
}
_a = Mail;
_Mail_transport = { value: createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    }) };
//# sourceMappingURL=mail.js.map