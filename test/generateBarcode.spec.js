import utility from "../built/utility/utility.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { MyErrors2 } from "../built/utility/constants.js";
import generateBarcode from '../built/Allocation/Asset/generateBarcode.js';
import Sinon from "sinon";
import Category from "../built/Allocation/Category/category2.js";
import Location from "../built/Tracking/location.js";
import Asset from "../built/Allocation/Asset/asset2.js";

describe("Generate Barcode Test", function () {
    const nonExistentCategoryID = 1000;
    const nonExistentLocationID = 1000;
    const invalidStatus = "Does Not Exist";

    const validCategoryID = 2;
    const existingLocation = 2;
    const validStatus = "Good";

    const assetID = 5000;

    this.beforeEach(function () {
        const categoryExistStub = Sinon.stub(Category, "_doesCategoryIDExist")
                                    .withArgs(nonExistentCategoryID)
                                    .resolves(false)
                                    .withArgs(validCategoryID)
                                    .resolves(true);
        const locationExistsStub = Sinon.stub(Location, "verifyLocationID")
                                    .withArgs(nonExistentLocationID)
                                    .resolves(false)
                                    .withArgs(validCategoryID)
                                    .resolves(true);
        const siteOfLocationStub = Sinon.stub(Location, "findIDOfSiteOfLocation")
                                    .withArgs(existingLocation)
                                    .resolves(existingLocation);
        const assetStatusCode = Sinon.stub(Asset, "getAssetStatusCode")
                                    .withArgs(validStatus)
                                    .returns("1")
    })

    it ("should fail when an invalid category is given", async function() {
        try {
            await generateBarcode(nonExistentCategoryID, existingLocation, validStatus);
            assert(false, "Error Should Have Been Thrown")
        } catch(err) {
            if (err instanceof MyError && err.message === MyErrors2.CATEGORY_NOT_EXIST) {
                assert(true)
            }
            else {
                console.log(err);
                assert(false, "Wrong Error thrown");
            }
        }
    });

    it("should fail when an invalid location is given", async function() {
        try {
            await generateBarcode(validCategoryID, nonExistentLocationID, assetID, validStatus);
            assert(false, "Error Should Have Been Thrown")
        } catch(err) {
            if (err instanceof MyError && err.message === MyErrors2.LOCATION_NOT_EXIST) {
                assert(true)
            }
            else {
                console.log(err);
                assert(false, "Wrong Error thrown");
            }
        }
    });

    it("should fail when an invalid status is given", async function() {
        try {
            await generateBarcode(validCategoryID, existingLocation, assetID, invalidStatus);
            assert(false, "Error Should Have Been Thrown")
        } catch(err) {
            if (err instanceof MyError && err.message === MyErrors2.ASSET_STATUS_NOT_EXIST) {
                assert(true)
            }
            else {
                console.log(err);
                assert(false, "Wrong Error thrown");
            }
        }
    });

    it("should generate the barcode if everything is valid", async function() {
        try {
            const result = await generateBarcode(validCategoryID, existingLocation, assetID, validStatus);
            assert.equal(result, "020200050001", "Wrong Barcode");
        } catch(err) {
            console.log(err);
            assert(false);
        }
    })
})