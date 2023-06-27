import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import Location from '../Tracking/location.js';
export function createBatch(date, comments, locationID) {
    return new Promise((res, rej) => {
        // Check if location exists
        Location.verifyLocationID(locationID).then(exists => {
            if (exists == false) {
                return rej(new MyError(Errors[66]));
            }
            // Create batch
            pool.query(gatepasstable.createBatch, [date, comments, locationID]).then(_ => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        });
    });
}
//# sourceMappingURL=createBatch.js.map