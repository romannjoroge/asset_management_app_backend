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
        console.log(logEvent);

        if (["CREATE_ASSET", "DELETE_ASSET", "UPDATE_ASSET"].includes(logEvent)) {
            return EventItemTypes.Asset;
        }
        else if (["CREATE_CATEGORY" , "DELETE_CATEGORY" , "UPDATE_CATEGORY"].includes(logEvent)) {
            return EventItemTypes.Category;
        }
        else if (["CREATE_LOCATION", "DELETE_LOCATION", "UPDATE_LOCATION"].includes(logEvent)) {
            return EventItemTypes.Location;
        }
        else if (["CREATE_READER", "DELETE_READER", "UPDATE_READER"].includes(logEvent)) {
            return EventItemTypes.Reader;
        }
        else if (["CREATE_USER", "DELETE_USER", "UPDATE_USER"].includes(logEvent)) {
            return EventItemTypes.User;
        }
        else if (["ASSET_REGISTER_REPORT", "ASSET_DEPRECIATION_SCHEDULE_REPORT", "ASSET_ACQUISITION_REPORT", "STOCK_TAKE_RECONCILIATION_REPORT", "CATEGORY_DERECIATION_CONFIGURATION_REPORT", "ASSET_CATEGORY_REPORT", "AUDIT_TRAIL_REPORT", "CHAIN_OF_CUSTODY_REPORT", "MOVEMENT_REPORT", "ASSET_DISPOSAL_REPORT", "GATEPASS_REPORT", "STATE_PHYSICAL_VERIFICATION_MISSING", "STATE_PHYSICAL_VERIFICATION_PRESENT"].includes(logEvent)) {
            return EventItemTypes.Report;
        }
        else if (["REQUEST_GATEPASS", "APPROVE_GATEPASS", "REJECT_GATEPASS"].includes(logEvent)) {
            return EventItemTypes.GatePass;
        }
        else if (["CREATE_INVENTORY", "DELETE_INVENTORY", "UPDATE_INVENTORY"].includes(logEvent)) {
            return EventItemTypes.Inventory;
        }
        else if (["CREATE_BATCH" , "DELETE_BATCH" , "UPDATE_BATCH" , "ASSIGN_BATCH_INVENTORY" , "UNASSIGN_BATCH_INVENTORY"].includes(logEvent)) {
            return EventItemTypes.Batch;
        } else {
            throw new MyError(MyErrors2.LOG_EVENT_NOT_EXIST);
        }
    }
}