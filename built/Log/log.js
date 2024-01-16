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
import { Logs, MyErrors2 } from '../utility/constants.js';
export var EventItemTypes;
(function (EventItemTypes) {
    EventItemTypes[EventItemTypes["Asset"] = 0] = "Asset";
    EventItemTypes[EventItemTypes["Category"] = 1] = "Category";
    EventItemTypes[EventItemTypes["Location"] = 2] = "Location";
    EventItemTypes[EventItemTypes["Reader"] = 3] = "Reader";
    EventItemTypes[EventItemTypes["User"] = 4] = "User";
    EventItemTypes[EventItemTypes["Report"] = 5] = "Report";
    EventItemTypes[EventItemTypes["GatePass"] = 6] = "GatePass";
    EventItemTypes[EventItemTypes["Inventory"] = 7] = "Inventory";
    EventItemTypes[EventItemTypes["Batch"] = 8] = "Batch";
})(EventItemTypes || (EventItemTypes = {}));
export class Log {
    // Create log
    static createLog(ipaddress, userid, eventid, itemid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(logTable.insertLog, [ipaddress, userid, itemid !== null && itemid !== void 0 ? itemid : 0, eventid]).then((_) => {
                    return res();
                }).catch((err) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_GENERATE_LOG));
                });
            });
        });
    }
    // Check if log event type exists
    static isLogEventValid(logEvent) {
        return Object.keys(Logs).includes(logEvent);
    }
    // Get type of item that event type belongs to
    static getLogEventItemType(logEvent) {
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
//# sourceMappingURL=log.js.map