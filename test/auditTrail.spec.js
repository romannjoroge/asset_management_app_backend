import utility from "../built/utility/utility.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { Logs, MyErrors2 } from "../built/utility/constants.js";
import Sinon from "sinon";
import getAuditTrail from '../built/Reports/audit_trail.js';
import User from "../built/Users/users.js";
import ReportDatabase from '../built/Reports/reportDatabase.js';

describe("Audit Trail Report Test", function () {
    // Values to be used in function
    const nonexistentuserid = 1000;
    const existinguserid = 2;
    const fromDate = new Date(2021, 0, 1);
    const toDate = new Date();
    const existingeventtype = "CREATE_ASSET";
    const nonexistenteventtype = "DOES_NOT_EXIST";

    const expectedResult = [{
        name_of_user: "User1",
        username: "User1",
        ip: "1",
        date_of_event: "123213",
        description: "sdf",
        item: "1",
    }];

    this.beforeEach(async () => {
        const userExistStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(nonexistentuserid)
                                .resolves(false)
                                .withArgs(existinguserid)
                                .resolves(true);
        const auditTrailStub = Sinon.stub(ReportDatabase, "getAuditTrails")
                                .withArgs(existinguserid, existingeventtype, fromDate, toDate)
                                .resolves(expectedResult)
    });

    it("should fail if user does not exist", async () => {
        try {
            await getAuditTrail(nonexistentuserid, existingeventtype, fromDate, toDate);
            assert(false, "Should Have Thrown user not exist error");
        } catch(err) {
            if(err instanceof MyError && err.message === MyErrors2.USER_NOT_EXIST) {
                assert(true)
            } else {
                console.log(err);
                assert(false, "Wrong error thrown");
            }
        }
    });

    it("should fail if eventtype is not supported", async () => {
        try {
            await getAuditTrail(existinguserid, nonexistenteventtype, fromDate, toDate);
            assert(false, "Should Have Thrown not supported event type");
        } catch(err) {
            if(err instanceof MyError && err.message === MyErrors2.LOG_EVENT_NOT_EXIST) {
                assert(true)
            } else {
                console.log(err);
                assert(false, "Wrong error thrown");
            }
        }
    });

    it("should return the correct events in date range", async () => {
        try {
            const results = await getAuditTrail(existinguserid, existingeventtype, fromDate, toDate);
            assert.deepEqual(results, expectedResult, "Wrong Thing Returned");
        } catch(err) {
            console.log(err);
            assert(false, "Error Thrown");
        }
    })
});