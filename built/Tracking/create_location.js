import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import Location from "./location.js";
export default function createLocation(name, companyName, parentlocationid) {
    return new Promise((res, rej) => {
        if (!parentlocationid) {
            console.log("No parent location");
            parentlocationid = -1;
        }
        // Check if location already exists
        console.log("Parent Location ID => ", parentlocationid);
        Location.doesLocationExist(name, parentlocationid).then(doesExist => {
            if (doesExist == true) {
                return rej(new MyError(MyErrors2.EXISTS_LOCATION));
            }
            if (parentlocationid === -1) {
                let query = "INSERT INTO Location (name, companyname) VALUES ($1, $2)";
                pool.query(query, [name, companyName]).then((_) => {
                    console.log(2);
                    return res();
                }).catch((err) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                });
            }
            else {
                // Create location
                console.log(3);
                let query = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, $3)";
                pool.query(query, [name, companyName, parentlocationid]).then((_) => {
                    console.log(4);
                    return res();
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                });
            }
        });
    });
}
//# sourceMappingURL=create_location.js.map