import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
export function allocateBatch(inventoryID, batchID) {
    return new Promise((res, rej) => {
        // Check if inventory exists
        pool.query(gatepasstable.checkIfInventoryExists, [inventoryID]).then((result) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[67]));
            }
            // Check if batch exists
            pool.query(gatepasstable.checkIfBatchExists, [batchID]).then((result) => {
                if (result.rowCount <= 0) {
                    return rej(new MyError(Errors[68]));
                }
                // Allocate batch
                pool.query(gatepasstable.allocateBatch, [inventoryID, batchID]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[69]));
                });
            }).catch(err => { });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[67]));
        });
    });
}
//# sourceMappingURL=allocateBatch.js.map