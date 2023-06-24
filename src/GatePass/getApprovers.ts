import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";

export function getApprovers(locationID: number): Promise<string[] | never> {
    return new Promise((res, rej) => {
        // Check if location exists
        Location.verifyLocationID(locationID).then(exists => {
            if (exists == false) {
                return rej(new MyError(Errors[3]));
            }

            let locationIDs: number[] = [];
            // Get parent locations
            Location.findParentLocations(locationID, locationIDs).then(_ => {
                // Get approvers for each location
                const offset = 1;
                locationIDs.push(locationID);
                console.log(locationIDs);
                function getName(names: string[], locationID: number): Promise<void | never> {
                    return new Promise((res2, rej2) => {
                        pool.query(`SELECT u.name FROM User2 u JOIN GatePassAuthorizers g ON g.username = u.username WHERE g.locationid = $1`, [locationID]).then(data => {
                            if (data.rowCount > 0) {
                                console.log(data.rows[0]['name']);
                                names.push(data.rows[0]['name']);
                            }
                            return res2();
                        }).catch(err => {
                            console.log(err);
                            return rej2(new MyError(Errors[9]));
                        });
                    });
                }

                let promises: Promise<void | never>[] = [];
                let names: string[] = [];
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