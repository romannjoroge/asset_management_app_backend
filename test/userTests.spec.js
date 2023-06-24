import pool from "../db2.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createTestReader } from "./commonTestFunctions.js";
import { updateUser } from '../built/Users/update.js';
import MyError from '../built/utility/myError.js';
import { Errors } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import { assert } from "chai";

describe.skip("Update User Tests", () => {
    let existingUser = {
        username: "johndoe",
        fname: "John",
        lname: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        company: "Test Company",
    };
    let existingUserRoles = ['Company Administrator', 'Asset User'];

    beforeEach(async () => {
        try {
            await createTemporaryTable("User2");
            await createTemporaryTable("userrole");
            await createTestUser(existingUser);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    async function assertThatFunctionWorks(username, updateJSON, newUser) {
        try {
            await updateUser(username, updateJSON);
            let result = await pool.query("SELECT * FROM User2 WHERE username = $1", [username]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Updated User");
            let updatedUser = {
                fname: result.rows[0].fname,
                lname: result.rows[0].lname,
                email: result.rows[0].email,
                username: result.rows[0].username,
                companyname: result.rows[0].companyname
            }
            assert.deepEqual(updatedUser, newUser, "User Was Not Updated Correctly");
        } catch(err) {
            console.log(err);
            assert(false, "An Error Should Not Have Been Thrown");
        }
    }

    async function assertThatFunctionFails(username, updateJSON, errorMessage) {
        try {
            await updateUser(username, updateJSON);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === errorMessage, err.message);
        }
    }

    it("should fail when user doesn't exist", async () => {
        await assertThatFunctionFails("sfsfsfs", {}, Errors[30]);
    });

    it("should update fname", async () => {
        let updateJSON = {
            fname: "Jane"
        };
    
        await assertThatFunctionWorks(existingUser.username, updateJSON, {
            fname: updateJSON.fname,
            lname: existingUser.lname,
            email: existingUser.email,
            username: existingUser.username,
            companyname: existingUser.company
        });
    });

    it("should update lname", async () => {
        let updateJSON = {
            lname: "Jefferson"
        };

        await assertThatFunctionWorks(existingUser.username, updateJSON, {
            fname: existingUser.fname,
            lname: updateJSON.lname,
            email: existingUser.email,
            username: existingUser.username,
            companyname: existingUser.company
        });
    });

    it("should update email", async () => {
        let updateJSON = {
            email: "sdfdfs@g.com"
        };

        await assertThatFunctionWorks(existingUser.username, updateJSON, {
            fname: existingUser.fname,
            lname: existingUser.lname,
            email: updateJSON.email,
            username: existingUser.username,
            companyname: existingUser.company
        });
    });

    it("should update password", async () => {
        let updateJSON = {
            password: "newpassword"
        };

        await assertThatFunctionWorks(existingUser.username, updateJSON, {
            fname: existingUser.fname,
            lname: existingUser.lname,
            email: existingUser.email,
            username: existingUser.username,
            companyname: existingUser.company
        });
    });

    it("should update roles", async () => {
        let updateJSON = {
            roles: ['Company Administrator', 'User Manager', 'RFID Reader']
        };

        try{
            await updateUser(existingUser.username, updateJSON);
            let result = await pool.query("SELECT r.name FROM Role r JOIN Userrole u ON u.roleid = r.id WHERE u.username = $1", [existingUser.username]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Updated User");
            let updatedUserRoles = result.rows.map(row => row.name);
            assert.deepEqual(updatedUserRoles, updateJSON.roles, "User Roles Were Not Updated Correctly");
        } catch(err) {
            console.log(err);
            assert(false, "An Error Should Not Have Been Thrown");
        }
    });

    afterEach(async () => {
        try {
            await dropTemporaryTable("User2");
            await dropTemporaryTable("userrole");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});