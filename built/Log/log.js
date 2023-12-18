var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import logTable from './db_log.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';
export class Log {
    // Create log
    static createLog(ipaddress, userid, eventid, itemid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(logTable.insertLog, [ipaddress, userid, itemid, eventid]).then((_) => {
                    return res();
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_GENERATE_LOG));
                });
            });
        });
    }
}
//# sourceMappingURL=log.js.map