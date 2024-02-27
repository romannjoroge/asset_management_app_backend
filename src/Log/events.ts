import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface Event {
    event_type: string;
    event_description: string;
}

export default function getEventsFromDatabase(): Promise<Event[]> {
    return new Promise((res, rej) => {
        let query = "SELECT type AS event_type, description AS event_description FROM Events";
        getResultsFromDatabase<Event>(query, []).then(events => {
            return res(events);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_EVENTS));
        })
    })
}