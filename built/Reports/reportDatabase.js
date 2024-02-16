import pool from "../../db2.js";
import reportTable from "./db_reports.js";
import { EventItemTypes, Log } from "../Log/log.js";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
export default class ReportDatabase {
    getAssetRegisterData() {
        return new Promise((res, rej) => {
            // Query to get data from database
            let query = `SELECT a.serialnumber AS serial_number, TO_CHAR(a.acquisitiondate, 'YYYY-MM-DD') AS acquisition_date, a.condition, (SELECT name AS responsible_users_name FROM User2 
                WHERE id = a.responsibleuserid LIMIT 1), a.acquisitioncost AS acquisition_cost, a.residualvalue AS residual_value, c.name AS category_name, 
                a.usefullife AS useful_life, a.barcode, a.description, a.locationid AS location_id, TO_CHAR(a.disposaldate, 'YYYY-MM-DD') AS expected_depreciation_date, 
                GREATEST(DATE_PART('day', disposaldate - NOW()), 0) AS days_to_disposal FROM Asset a FULL JOIN Category c ON c.id = a.categoryid`;
            // Call query and return results
            pool.query(query, []).then((fetchResult) => {
                return res(fetchResult.rows);
            }).catch((err) => {
                // Throw database error
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_GET_FROM_DATABASE));
            });
        });
    }
    // Function to get audit trail details
    static getAuditTrails(userid, eventtype, fromDate, toDate) {
        return new Promise((res, rej) => {
            // Get the type of item the audit trail is 
            let itemtype = Log.getLogEventItemType(eventtype);
            // Get the query to use based on itemtype
            let query;
            switch (itemtype) {
                case EventItemTypes.Asset:
                    query = reportTable.assetaudittrail;
                    break;
                case EventItemTypes.Category:
                    query = reportTable.categoryaudittrail;
                    break;
                case EventItemTypes.Location:
                    query = reportTable.locationaudittrail;
                    break;
                case EventItemTypes.User:
                    query = reportTable.useraudittrail;
                    break;
                case EventItemTypes.Report:
                    query = reportTable.useraudittrail;
                    break;
                case EventItemTypes.Reader:
                    query = reportTable.readeraudittrail;
                    break;
                case EventItemTypes.GatePass:
                    query = reportTable.gatepassaudittrail;
                    break;
                case EventItemTypes.Batch:
                    query = reportTable.batchaudittrail;
                    break;
                case EventItemTypes.Inventory:
                    query = reportTable.inventoryaudittral;
                    break;
                default:
                    return rej(new MyError(MyErrors2.LOG_EVENT_NOT_EXIST));
            }
            console.log(query);
            // Run query
            pool.query(query, [userid, eventtype, fromDate, toDate]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return res([]);
                }
                const results = fetchResult.rows.map((e) => {
                    return {
                        name_of_user: e.name,
                        username: e.username,
                        ip: e.ipaddress,
                        date_of_event: e.timestamp.toISOString().slice(0, 10),
                        description: e.description,
                        item: e.item
                    };
                });
                return res(results);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        });
    }
}
//# sourceMappingURL=reportDatabase.js.map