import { assert } from "chai";
import MyError from '../built/utility/myError.js';
import { Errors, MyErrors2 } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import pool from "../db2.js";
import Sinon from "sinon";
import Auth from '../built/Auth/auth.js';
import User from "../built/Users/users.js";

describe("Generating OTP Test", () => {
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