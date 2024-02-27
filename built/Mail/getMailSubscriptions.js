import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export default function getMailSubscriptionIDs() {
    return new Promise((res, rej) => {
        let query = "SELECT name, id FROM MailSubscriptions WHERE deleted = false";
        getResultsFromDatabase(query, []).then(mailinglist => {
            return res(mailinglist);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_MAIL_SUBSCRIPTIONS));
        });
    });
}
//# sourceMappingURL=getMailSubscriptions.js.map