import gatepasstable from './db_gatepass.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
export function createInventory(name) {
    return new Promise((res, rej) => {
        pool.query(gatepasstable.createInventory, [name]).then(_ => {
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
//# sourceMappingURL=createInventory.js.map