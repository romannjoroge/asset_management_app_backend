import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import Location from '../Tracking/location.js';
import Asset from '../Allocation/Asset/asset2.js';

interface inventoryResults {
    id: number;
    name: string;
}

interface batchResults {
    id: number;
    date: Date;
    comments: string;
    locationid: number;
}

interface BatchResultsFetchRequest {
    rowCount: number;
    rows: batchResults[];
}

interface InventoryResultFetchRequest {
    rowCount: number;
    rows: inventoryResults[];
}

export function allocateBatch(inventoryID: number, batchID: number): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if inventory exists
        pool.query(gatepasstable.checkIfInventoryExists, [inventoryID]).then((result: InventoryResultFetchRequest) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[67]));
            }

            // Check if batch exists
            pool.query(gatepasstable.checkIfBatchExists, [batchID]).then((result: BatchResultsFetchRequest) => {
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
            }).catch(err => {});
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[67]));
        });
    });
}