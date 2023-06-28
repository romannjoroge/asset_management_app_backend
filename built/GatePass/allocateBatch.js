import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
export function allocateBatch(inventoryID, batchIDs) {
    return new Promise((res, rej) => {
        // Check if inventory exists
        pool.query(gatepasstable.checkIfInventoryExists, [inventoryID]).then((result) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[67]));
            }
            let promises = [];
            // Confirm if all batches exist
            batchIDs.forEach(batchID => promises.push(checkIfBatchExists(batchID)));
            Promise.all(promises).then(_ => {
                // Allocate batches
                promises = [];
                batchIDs.forEach(batchID => promises.push(allocateBatchInDB(inventoryID, batchID)));
                Promise.all(promises).then(_ => {
                    return res();
                }).catch(err => {
                    return rej(err);
                });
            }).catch(err => {
                return rej(err);
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[67]));
        });
    });
}
function checkIfBatchExists(batchID) {
    return new Promise((res, rej) => {
        pool.query(gatepasstable.checkIfBatchExists, [batchID]).then((result) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[68]));
            }
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[68]));
        });
    });
}
function allocateBatchInDB(inventoryID, batchID) {
    return new Promise((res, rej) => {
        // Allocate batch
        pool.query(gatepasstable.allocateBatch, [inventoryID, batchID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[69]));
        });
    });
}
//# sourceMappingURL=allocateBatch.js.map