import pool from "../../../db2.js";
import { MyErrors2 } from "../../utility/constants.js";
import getResultsFromDatabase from "../../utility/getResultsFromDatabase.js";
import MyError from "../../utility/myError.js";
export default function createAssetStatus(name, description) {
    return new Promise((res, rej) => {
        // Check if asset already exists
        checkIfEventExists(name).then(eventExists => {
            if (eventExists == true) {
                return rej(new MyError(MyErrors2.EVENT_ALREADY_EXISTS));
            }
            // Create event
            let query = "INSERT INTO AssetStatus(name, description) VALUES ($1, $2)";
            pool.query(query, [name, description]).then((_) => {
                return res();
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_ADD_EVENT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_EVENT));
        });
    });
}
function checkIfEventExists(name) {
    return new Promise((res, rej) => {
        let query = "SELECT name FROM AssetStatus WHERE name = $1";
        getResultsFromDatabase(query, [name]).then(results => {
            if (results.length > 0) {
                return res(true);
            }
            else {
                return res(false);
            }
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_CHECK_IF_EVENT_EXISTS));
        });
    });
}
//# sourceMappingURL=addAssetStatus.js.map