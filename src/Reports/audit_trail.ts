import { Log } from "../Log/log.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";

// When given a userid, eventtype and date range give record of events that user did
export interface AuditTrailEntry {
    name_of_user: string;
    username: string;
    ip: string;
    date_of_event: string;
    description: string;
    item?: string;
}

export default async function getAuditTrail(userid: number, eventtype: string, fromDate: Date, toDate: Date): Promise<AuditTrailEntry[]> {
    try {
        console.log(1)
        // Throw error if user does not exist
        const userExist = await User.checkIfUserIDExists(userid);
        if (userExist === false) {
            throw new MyError(MyErrors2.USER_NOT_EXIST);
        }
        console.log(2)

        // Throw error if log event type does not exist
        const logEventExists = Log.isLogEventValid(eventtype);
        if (logEventExists === false) {
            throw new MyError(MyErrors2.LOG_EVENT_NOT_EXIST);
        }
        console.log(3)

        // Get and return audit trails
        const audittrails = await ReportDatabase.getAuditTrails(userid, eventtype, fromDate, toDate);
        console.log(4)

        return audittrails;
    } catch(err) {
        if (err instanceof MyError) {
            throw err;
        } else {
            throw new MyError(MyErrors2.NOT_GENERATE_REPORT);
        }
    }
}