import {MyErrors2} from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface userMailSubscriptions {
  name: string,
  subscription: string;
  description: string
}

export default function getUserMailSubscriptions(): Promise<userMailSubscriptions[]> {
  return new Promise((res, rej) => {
    let query = "SELECT u.name, m.name AS subscription, m.description FROM MailingList ml LEFT JOIN mailsubscriptions m ON ml.mailsubscriptionid = m.id LEFT JOIN User2 u ON u.id = ml.userid";
    getResultsFromDatabase<userMailSubscriptions>(query, []).then(results => {
      return res(results);
    }).catch((err) => {
      console.log(err);
      return rej(new MyError(MyErrors2.NOT_GET_USER_MAIL_SUBSCRIPTIONS)); 
    })
  });
}
