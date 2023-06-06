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
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
describe.skip("Add Asset Test", function () {
    let barcode = "ASDFASDF";
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
                yield pool.query(`INSERT INTO Asset (barcode, locationID, noinbuilding, code, description,
                categoryID, usefullife, serialnumber, condition, responsibleusername, acquisitiondate,
                residualvalue, acquisitioncost, disposalvalue, disposaldate, currentvaluationvalue, latestvaluationdate,
                depreciationtype, depreciationpercent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`, [
                    barcode, 1, 1, "ASDFASDF", "This is a test asset", 1, 1, "ASDFASDF", "Good", "TestUser", "12-12-2021", 1, 10000, 1, "12-12-2021", 1, "12-12-2021", "Straight Line", 0
                ]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could not run database queries");
            }
        });
    });
    it("should add asset to database", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new Asset
            let asset = new Asset("SDFDSFDS", 12, "12-12-2021", 1, "Good", "TestUser", 10000, "TestCategory2", [], 1, "ASDFFSDFDS", 0, "SDFSF", "This is a test asset", "Straight Line", 0);
            yield asset.initialize();
            let fethcResult = yield pool.query("SELECT * FROM Asset WHERE barcode = 'SDFDSFDS'");
            console.log(fethcResult.rows[0]);
            assert(true, "Shit Works");
        });
    });
    it("should return false if barcode doesn't exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let barcode = "SOME BAR CODE";
            try {
                let doesExist = yield Asset._doesBarCodeExist(barcode);
                assert(doesExist === false, "True Returned");
            }
            catch (err) {
                console.log(err);
                assert(false, "Error Thrown");
            }
        });
    });
    it("should return true if barcode exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let doesExist = yield Asset._doesBarCodeExist(barcode);
                assert(doesExist, "False Returned");
            }
            catch (err) {
                console.log(err);
                assert(false, "Error Thrown");
            }
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could not delete temp tables");
            }
        });
    });
});
