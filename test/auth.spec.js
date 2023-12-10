import { assert } from "chai";
import MyError from '../built/utility/myError.js';
import { Errors, MyErrors2 } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import pool from "../db2.js";
import Sinon from "sinon";
import Auth from '../built/Auth/auth.js';
import User from "../built/Users/users.js";

describe.skip("Generating OTP Test", () => {
    it("should fail when given a user that does not exist", async () => {
        const non_existent_user = 1000;

        try {
            await Auth.generateOTP(non_existent_user);
            assert(false, "User Not Exist Error Should Be Thrown");
        } catch(err) {
            if (err instanceof MyError && err.message == MyErrors2.USER_NOT_EXIST) {
                assert(true)
            } else {
                assert(false, `${err} should not be thrown`)
            }
        }
    })

    it("should create otp if user exists", async() => {
        const existing_user = 1;
        const current_date = new Date();
        const generateOTP = "834535";

        // Create stubs
        const userExistsStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(existing_user)
                                .resolves(true);
        

        // Call function
        try {
            await Auth.generateOTP(existing_user);
            assert(true)
        } catch(err) {
            assert(false, `${err} should not be thrown`)
        }
        
    })
});

describe("Verify OTP", () => {
    it("should return false if user does not exist", async () => {
        let non_existent_user = 1000;

        let userExistsStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(non_existent_user)
                                .resolves(false);
        
        // Call function
        try {
            const exists = await Auth.verifyOTP(non_existent_user, "");
            assert(exists === false,  "False should be returned");
        } catch(err) {
            console.log(err);
            assert(false, `${err} should not be thrown`);
        }
    });

    it("should return false if the user exists but there is not OTP record", async () => {
        let existing_user = 20;

        let userExistsStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(existing_user)
                                .resolves(true);
        

        // Call function
        try {
            const exists = await Auth.verifyOTP(existing_user, "");
            assert(exists === false,  "False should be returned");
        } catch(err) {
            console.log(err);
            assert(false, `${err} should not be thrown`);
        }
    });

    it("should return false if the user exists, there is an OTP record but it is wrong", async () => {
        let existing_user = 1;
        let wrong_OTP = "";

        let userExistsStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(existing_user)
                                .resolves(true);
        

        // Call function
        try {
            const exists = await Auth.verifyOTP(existing_user, wrong_OTP);
            assert(exists === false,  "False should be returned");
        } catch(err) {
            console.log(err);
            assert(false, `${err} should not be thrown`);
        }
    });

    it("should return false if the user exists, there is an OTP record, it is the right OTP but it has expired", async () => {
        let existing_user = 1;
        let correct_OTP = "783333";

        let userExistsStub = Sinon.stub(User, "checkIfUserIDExists")
                                .withArgs(existing_user)
                                .resolves(true);
        

        // Call function
        try {
            const exists = await Auth.verifyOTP(existing_user, correct_OTP);
            assert(exists === false,  "False should be returned");
        } catch(err) {
            console.log(err);
            assert(false, `${err} should not be thrown`);
        }
    });
})