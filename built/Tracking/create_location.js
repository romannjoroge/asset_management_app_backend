import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import Location from "./location.js";
export default function createLocation(name, parentlocationid, companyName) {
    return new Promise((res, rej) => {
        // Check if location already exists
        Location.doesLocationExist(name, parentlocationid).then(doesExist => {
            if (doesExist == true) {
                return rej(new MyError(MyErrors2.EXISTS_LOCATION));
            }
            if (parentlocationid === -1) {
                let query = "INSERT INTO Location (name, companyname) VALUES ($1, $2)";
                pool.query(query, [name, parentlocationid]).then((_) => {
                    return res();
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                });
            }
            else {
                // Create location
                let query = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, $3)";
                pool.query(query, [name, companyName, parentlocationid]).then((_) => {
                    return res();
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                });
            }
        });
    });
}
//# sourceMappingURL=create_location.js.map