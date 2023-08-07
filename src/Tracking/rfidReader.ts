import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import locationTable from "./db_location.js";

export function createRFIDReader(readerID: string, locationID: number, entry: boolean): Promise<void> {
    return new Promise((res, rej) => {
        // Run database query
        pool.query(locationTable.createRFIDReader, [readerID, locationID, entry]).then(_ => {}).catch(err => {
            return rej(MyErrors2.NOT_CREATE_READER);
        });
    });
}