import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface MailSubsricptionIDs {
    name: string;
    id: number;
}

export default function getMailSubscriptionIDs(): Promise<MailSubsricptionIDs[]> {
    return new Promise((res, rej) => {
        let query = "SELECT name, id FROM MailSubscriptions WHERE deleted = false";

        getResultsFromDatabase<MailSubsricptionIDs>(query, []).then(mailinglist => {
            return res(mailinglist);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_MAIL_SUBSCRIPTIONS));
        })
    })
}