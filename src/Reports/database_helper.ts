import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import { ResultFromDatabase } from "../utility/helper_types.js";
import MyError from "../utility/myError.js";

export interface RawAssetRegisterData {
    serial_number: string;
    acquisition_date: string;
    condition: string;
    responsible_users_name: string;
    acquisition_cost: number;
    residual_value: number;
    category_name: string;
    useful_life: number;
    barcode: string;
    description: string;
    location_id: number;
    expected_depreciation_date: string;
    days_to_disposal: number
}

/**
 * A class that provides some abstraction between database and code that needs to get data from database.
 * It provides functions for getting the data for the various reports
 */

export class ReportsDatabaseHelper {
    getAssetRegisterData(): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            // Query to get data from database
            let query = `SELECT a.serialnumber AS serial_number, TO_CHAR(a.acquisitiondate, 'YYYY-MM-DD') AS acquisition_date, a.condition, (SELECT name AS responsible_users_name FROM User2 
                WHERE id = a.responsibleuserid LIMIT 1), a.acquisitioncost AS acquisition_cost, a.residualvalue AS residual_value, c.name AS category_name, 
                a.usefullife AS useful_life, a.barcode, a.description, a.locationid AS location_id, TO_CHAR(a.disposaldate, 'YYYY-MM-DD') AS expected_depreciation_date, 
                GREATEST(DATE_PART('day', disposaldate - NOW()), 0) AS days_to_disposal FROM Asset a FULL JOIN Category c ON c.id = a.categoryid`;

            // Call query and return results
            pool.query(query, []).then((fetchResult: ResultFromDatabase<RawAssetRegisterData>) => {
                return res(fetchResult.rows);
            }).catch((err: any) => {
                // Throw database error
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_GET_FROM_DATABASE));
            })
        })
    }
}
