import pool from "../db2.js";
import { assert, use } from "chai";
import {create_log} from "../built/Log/create_log.js";
import MyError from "../built/utility/myError.js";
import { createTemporaryTable, createTestEvent, createTestUser, dropTemporaryTable } from "./commonTestFunctions.js";

// Test suite for the create log function
describe("Create Log Tests", function () {
    let existingUser = {
        username: "johndoe",
        name: 'John Doe',
        email: "johndoe@gmail.com",
        password: "password",
        company: "Test Company",
        id: 10
    };

    let testEvent = {
        id: 1,
        type: "TEST_EVENT",
        description: "Unknown Event"
    };

    // Initialize Log table
    beforeEach(async () => {
        try {
            await createTemporaryTable("Events");
            await createTestEvent(testEvent);
            await createTemporaryTable("User2");
            await createTestUser(existingUser);
            await createTemporaryTable("Log");
        } catch(err) {
            console.log(err);
            assert(false, "Error Initializing Tests");
        }
    });

    // It should create an entry in the log table
    it("should create an entry in the log table", async function() {
        // Create an entry in the log table given a timestamp, username, ip address, event and an item id
        let timestamp = new Date();
        let username = existingUser.username;
        let event = testEvent.description;
        let ip_address = "192.168.1.128";
        let item_id = 1;

        try {
            await create_log(timestamp, username, event, ip_address, item_id);
            let fetchresult = await pool.query("SELECT timestamp, ipaddress, userid, itemid, eventid FROM Log ORDER BY id DESC LIMIT 1");
            let created_log = {
                timestamp: fetchresult.rows[0].timestamp,
                ip_address: fetchresult.rows[0].ipaddress,
                userid: fetchresult.rows[0].userid,
                item_id: fetchresult.rows[0].itemid,
                event_id: fetchresult.rows[0].eventid
            }

            let expected_log = {
                timestamp: timestamp,
                ip_address: ip_address,
                userid: existingUser.id,
                item_id: item_id,
                event_id: testEvent.id
            };

            assert.deepEqual(created_log, expected_log, "Wrong Log Created");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Meant To Be Thrown");
        }
    });

    // Cleaning up after tests
    afterEach(async () => {
        try {
            await dropTemporaryTable("Events");
            await dropTemporaryTable("User2");
            await dropTemporaryTable("Log");
        } catch(err) {
            console.log(err);
            assert(false, "Error Cleaning Up Tests");
        }
    });
});
