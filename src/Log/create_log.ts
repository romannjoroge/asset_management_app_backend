import log_table from "./db_log.js";
import pool from "../../db2.js";
import { AuditTrailEvents } from "../Audit_Trail/events.js";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
/**
 * @param timestamp timestamp of the event that happened
 * @param username name of the user that performed the event
 * @param event the description of event that occured, would be one of the values of the AuditTrailEvents enum otherwise it is unkown by default
 * @param ip_address the ip address of the user that caused the event
 * @param item_id an optional id of the item that was affected by the event
 * @description the function adds events to the systems log table
 */
export function create_log(timestamp: Date, username: string, event: string, ip_address: string, item_id: number): Promise<void> {
    return new Promise((res, rej) => {
        // Check if event is in the events enum, otherwise replace with unknown event
        if (Object.values(AuditTrailEvents).includes(event) == false) {
            event = AuditTrailEvents.UNKOWN;
        }

        // Add log 
        pool.query(log_table.create_log, [timestamp, ip_address, username, item_id, event]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_CREATE_LOG));
        })
    });
}