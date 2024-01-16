var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from "../Log/log.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
export default function getAuditTrail(userid, eventtype, fromDate, toDate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Throw error if user does not exist
            const userExist = yield User.checkIfUserIDExists(userid);
            if (userExist === false) {
                throw new MyError(MyErrors2.USER_NOT_EXIST);
            }
            // Throw error if log event type does not exist
            const logEventExists = Log.isLogEventValid(eventtype);
            if (logEventExists === false) {
                throw new MyError(MyErrors2.LOG_EVENT_NOT_EXIST);
            }
            return [];
        }
        catch (err) {
            if (err instanceof MyError) {
                throw err;
            }
            else {
                throw new MyError(MyErrors2.NOT_GENERATE_REPORT);
            }
        }
    });
}
//# sourceMappingURL=audit_trail.js.map