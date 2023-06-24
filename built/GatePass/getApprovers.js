import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import gatepasstable from "./db_gatepass.js";
export function getApprovers(locationID) {
    return new Promise((res, rej) => {
        // Check if location exists
        Location.verifyLocationID(locationID).then(exists => {
            if (exists == false) {
                return rej(new MyError(Errors[3]));
            }
            let locationIDs = [];
            // Get parent locations
            Location.findParentLocations(locationID, locationIDs).then(_ => {
                // Get approvers for each location
                const offset = 1;
                locationIDs.push(locationID);
                console.log(locationIDs);
                function getName(names, locationID) {
                    return new Promise((res2, rej2) => {
                        pool.query(gatepasstable.getApprovers, [locationID]).then(data => {
                            if (data.rowCount > 0) {
                                console.log(data.rows[0]['name']);
                                names.push({ name: data.rows[0]['name'], username: data.rows[0]['username'] });
                            }
                            return res2();
                        }).catch(err => {
                            console.log(err);
                            return rej2(new MyError(Errors[9]));
                        });
                    });
                }
                let promises = [];
                let names = [];
                locationIDs.forEach(locationID => promises.push(getName(names, locationID)));
                Promise.all(promises).then(() => {
                    return res(names);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[3]));
        });
    });
}
//# sourceMappingURL=getApprovers.js.map