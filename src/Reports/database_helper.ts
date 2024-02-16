import pool from "../../db2.js";

interface RawAssetRegisterData {
    serial_number: string;
    acquisition_date: Date;
    condition: string;
    responsible_users_name: string;
    acquisition_cost: number;
    residual_value: number;
    category_name: string;
    useful_life: number;
    barcode: string;
    description: string;
    location_id: number;
    expected_depreciation_date: Date;
    days_to_disposal: number
}

/**
 * A class that provides some abstraction between database and code that needs to get data from database.
 * It provides functions for getting the data for the various reports
 */

export class ReportsDatabaseHelper {
    getAssetRegisterData() {
        // Query to get data from database
        let query = `SELECT a.serialnumber AS serial_number, a.acquisitiondate AS acquisition_date, a.condition, (SELECT name AS responsible_users_name FROM User2 
        WHERE id = a.responsibleuserid LIMIT 1), a.acquisitioncost AS acquisition_cost, a.residualvalue AS residual_value, c.name AS category_name, 
        a.usefullife AS useful_life, a.barcode, a.description, a.locationid AS location_id, a.disposaldate AS expected_depreciation_date, 
        GREATEST(DATE_PART('day', disposaldate - NOW()), 0) AS days_to_disposal FROM Asset a FULL JOIN Category c ON c.id = a.categoryid`;
    }
}