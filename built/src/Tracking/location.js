var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';
// Importing custom classes
import MyError from '../../utility/myError.js';
import locationTable from './db_location.js';
class Location {
    constructor() { }
    static verifyLocationID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Returns true if locationID exists in the database, false otherwise
            let fetchResult;
            try {
                fetchResult = yield pool.query(locationTable.getLocation, [id]);
            }
            catch (err) {
                throw new MyError(message);
            }
            return (fetchResult.rowCount > 0);
        });
    }
}
export default Location;
