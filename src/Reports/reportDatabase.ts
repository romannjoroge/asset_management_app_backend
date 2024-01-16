import pool from "../../db2.js";
import reportTable from "./db_reports.js";
import { EventItemTypes, Log } from "../Log/log.js";
import { AuditTrailEntry } from "./audit_trail.js";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";

interface RawAuditTrailResults {
    name: string;
    username: string;
    ipaddress: string;
    timestamp: Date,
    description: string;
    item: string
}

interface AuditTrailFetchResult {
    rowCount: number;
    rows: RawAuditTrailResults[]
}

class ReportDatabase {
    // Function to get audit trail details
    static getAuditTrails(userid: number, eventtype: string, fromDate: Date, toDate: Date): Promise<AuditTrailEntry[]> {
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

            // Run query
            pool.query(query, [userid, eventtype]).then((fetchResult: AuditTrailFetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return res([]);
                }

                const results: AuditTrailEntry[] = fetchResult.rows.map((e) => {
                    return {
                        name_of_user: e.name,
                        username: e.username,
                        ip: e.ipaddress,
                        date_of_event: e.timestamp.toISOString().slice(0, 10),
                        description: e.description,
                        item: e.item
                    }
                })

                return res(results);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        })
    }
}