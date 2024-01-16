import logTable from './db_log.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Logs, MyErrors2 } from '../utility/constants.js';

export enum EventItemTypes {
    Asset,
    Category,
    Location,
    Reader,
    User,
    Report,
    GatePass,
    Inventory,
    Batch
}

export class Log {
    // Create log
    static async createLog(ipaddress: string, userid: number, eventid: number, itemid?: number): Promise<void> {
        return new Promise((res, rej) => {
            pool.query(logTable.insertLog, [ipaddress, userid, itemid ?? 0, eventid]).then((_: any) => {
                return res();
            }).catch((err: any) => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_GENERATE_LOG));
            })
        })
    }

    // Check if log event type exists
    static isLogEventValid(logEvent: string): boolean {
        return Object.keys(Logs).includes(logEvent);
    }

    // Get type of item that event type belongs to
    static getLogEventItemType(logEvent: string): EventItemTypes {
        switch (logEvent) {
            case "CREATE_ASSET" || "DELETE_ASSET" || "UPDATE_ASSET":
                return EventItemTypes.Asset;
            case "CREATE_CATEGORY" || "DELETE_CATEGORY" || "UPDATE_CATEGORY":
                return EventItemTypes.Category;
            case "CREATE_LOCATION" || "DELETE_LOCATION" || "UPDATE_LOCATION":
                return EventItemTypes.Location;
            case "CREATE_READER" || "DELETE_READER" || "UPDATE_READER":
                return EventItemTypes.Reader;
            case "CREATE_USER" || "DELETE_USER" || "UPDATE_USER":
                return EventItemTypes.User;
            case "ASSET_REGISTER_REPORT" || "ASSET_DEPRECIATION_SCHEDULE_REPORT" || "ASSET_ACQUISITION_REPORT" || "STOCK_TAKE_RECONCILIATION_REPORT" || "CATEGORY_DERECIATION_CONFIGURATION_REPORT" || "ASSET_CATEGORY_REPORT" || "AUDIT_TRAIL_REPORT" || "CHAIN_OF_CUSTODY_REPORT" || "MOVEMENT_REPORT":
                return EventItemTypes.Report;
            case "REQUEST_GATEPASS" || "APPROVE_GATEPASS" || "REJECT_GATEPASS":
                return EventItemTypes.GatePass;
            case "CREATE_INVENTORY" || "DELETE_INVENTORY" || "UPDATE_INVENTORY":
                return EventItemTypes.Inventory;
            case "CREATE_BATCH" || "DELETE_BATCH" || "UPDATE_BATCH" || "ASSIGN_BATCH_INVENTORY" || "UNASSIGN_BATCH_INVENTORY":
                return EventItemTypes.Batch;
            default:
                throw new MyError(MyErrors2.LOG_EVENT_NOT_EXIST);
        }
    }
}