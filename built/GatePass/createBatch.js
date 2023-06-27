import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import Location from '../Tracking/location.js';
import Asset from '../Allocation/Asset/asset2.js';
export function createBatch(date, comments, locationID, assets) {
    return new Promise((res, rej) => {
        // Check if location exists
        Location.verifyLocationID(locationID).then(exists => {
            if (exists == false) {
                return rej(new MyError(Errors[66]));
            }
            let promises = [];
            assets.forEach(asset => promises.push(throwErrorIfAssetDoesntExist(asset)));
            Promise.all(promises).then(ids => {
                // Create batch
                pool.query(gatepasstable.createBatch, [date, comments, locationID]).then(_ => {
                    // Get created batch id
                    pool.query(gatepasstable.getBatchID, [locationID, date, comments]).then(result => {
                        if (result.rowCount <= 0) {
                            return rej(new MyError(Errors[9]));
                        }
                        let batchID = result.rows[0]['max'];
                        let promises2 = [];
                        assets.forEach((asset, i) => promises2.push(insertBatchAsset(ids[i], batchID)));
                        Promise.all(promises).then(_ => {
                            return res();
                        }).catch(err => {
                            return rej(err);
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            }).catch(err => {
                return rej(err);
            });
        });
    });
}
function throwErrorIfAssetDoesntExist(barcode) {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(id => {
            return res(id);
        }).catch(err => {
            return rej(err);
        });
    });
}
function insertBatchAsset(assetID, batchID) {
    return new Promise((res, rej) => {
        pool.query(gatepasstable.insertBatchAsset, [assetID, batchID]).then(_ => {
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
//# sourceMappingURL=createBatch.js.map