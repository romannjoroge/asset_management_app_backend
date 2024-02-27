import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface UsersSubscribed {
    email: string;
    username: string;
    id: number
}

export default function getUsersSubscribedToMailSubscription(subscriptionid: number): Promise<UsersSubscribed[]> {
    return new Promise((res, rej) => {
        let query = "SELECT u.username, u.email, u.id FROM MailingList m INNER JOIN User2 u ON m.userid = u.id WHERE m.mailsubscriptionid = $1 AND m.deleted = false";

        getResultsFromDatabase<UsersSubscribed>(query, [subscriptionid]).then(users => {
            return res(users);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_MAIL_LIST));
        })
    })
}