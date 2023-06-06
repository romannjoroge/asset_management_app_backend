var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing the database pool
import pool from '../db2.js';
import { assert } from 'chai';
import Asset from '../src/Allocation/Asset/asset2.js';
import utility from '../utility/utility.js';
describe.skip("Allocate Asset To User Test", function () {
    let assetTag;
    let username;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            assetTag = 'AUA0001';
            username = 'John Doe';
            try {
                yield pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
                yield pool.query("INSERT INTO Asset VALUES ('AUA0001', 'Test At Test Company', true, 'adfsfsdfs', '10-13-2002', 1, 'good', 'John Doe', 10000, 100, 0, 1, 4)");
                yield pool.query('CREATE TEMPORARY TABLE User2 (LIKE User2 INCLUDING ALL)');
                yield pool.query("INSERT INTO User2 VALUES ('John', 'Doe', 'johndoe@gmail.com', 'gsdgsdgsd', 'John Doe', 'TestCompany')");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could not run database queries");
            }
        });
    });
    it("should fail when an asset that doesn't exist is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            assetTag = "Does Not Exist";
            yield utility.assertThatAsynchronousFunctionFails(Asset.allocateAsset, "Asset Does Not Exist", assetTag, username);
        });
    });
    it("should fail when a username that doesn't exist is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            username = "Does Not Exist";
            yield utility.assertThatAsynchronousFunctionFails(Asset.allocateAsset, "User Does Not Exist", assetTag, username);
        });
    });
    it("should pass when an asset and user that already exists is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Asset.allocateAsset(assetTag, username);
                let fetchResult = yield pool.query("SELECT custodianName FROM Asset WHERE assetTag=$1", [assetTag]);
                utility.verifyDatabaseFetchResults(fetchResult, "Asset Not Allocated");
                let custodianName = fetchResult.rows[0].custodianname;
                assert.equal(custodianName, username, "Wrong User Assigned to Asset");
            }
            catch (err) {
                console.log(err);
                assert(false, "No Error Should be thrown");
            }
        });
    });
    afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query('DROP TABLE IF EXISTS pg_temp.Asset');
                yield pool.query('DROP TABLE IF EXISTS pg_temp.User2');
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Delete Temporary Tables");
            }
        });
    });
});
