import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export default function getEventsFromDatabase() {
    return new Promise((res, rej) => {
        let query = "SELECT type AS event_type, description AS event_description FROM Events";
        getResultsFromDatabase(query, []).then(events => {
            return res(events);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_EVENTS));
        });
    });
}
//# sourceMappingURL=events.js.map