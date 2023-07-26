import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
export function createInventory(name) {
    return new Promise((res, rej) => {
        pool.query(gatepasstable.createInventory, [name]).then(_ => {
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
export function returnInventories() {
    return new Promise((res, rej) => {
        // Run query to fetch all inventories that are not deleted
        pool.query(gatepasstable.returnInventories).then((result) => {
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
//# sourceMappingURL=createInventory.js.map