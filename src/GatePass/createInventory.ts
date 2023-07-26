import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';

export function createInventory(name: string): Promise<void | never> {
    return new Promise((res, rej) => {
        pool.query(gatepasstable.createInventory, [name]).then(_ => {
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[9]))
        })
    });
}

interface GetInventory {
    id: number;
    name: string;
}

interface GetInventoriesFetchResult {
    rows: GetInventory[];
    rowCount: number;
}

export function returnInventories(): Promise<GetInventory[]> {
    return new Promise((res, rej) => {
        // Run query to fetch all inventories that are not deleted
        pool.query(gatepasstable.returnInventories).then((result: GetInventoriesFetchResult) => {
            // Check if query returned any rows
            if (result.rowCount === 0) {
                return rej(new MyError(MyErrors2.NOT_GET_INVENTORIES));
            }
            // If rows are returned, return them
            return res(result.rows);
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_GET_INVENTORIES));
        });
    });
}