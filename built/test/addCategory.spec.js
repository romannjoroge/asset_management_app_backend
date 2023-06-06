var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing modules used to write tests
import { assert } from 'chai';
import sinon from 'sinon';
import Category from '../src/Allocation/Category/category2.js';
import MyError from '../utility/myError.js';
import Folder from '../src/Allocation/Folder/folder.js';
// Creating the test suite
describe.skip("addCategory Test", function () {
    let category;
    let depreciaitionType;
    let depreciationPercentage;
    let categoryName;
    let parentFolderID;
    let doesCategoryExistStub;
    let saveCategoryStub;
    let doesFolderExistStub;
    function assertThatCategotyConstructorFails(errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                category = new Category(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
                yield category.initialize();
                assert(false, "An error should have been thrown");
            }
            catch (err) {
                if (err instanceof MyError && err.message === errorMessage) {
                    assert(true);
                }
                else {
                    console.log(err);
                    assert(false, "Wrong Error Thrown");
                }
            }
        });
    }
    function assertThatCategoryConstructorSucceds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                category = new Category(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
                yield category.initialize();
                assert(true);
            }
            catch (err) {
                console.log(err);
                assert(false, "No error should have been thrown");
            }
        });
    }
    this.beforeEach(function () {
        depreciaitionType = "Written Down Value";
        depreciationPercentage = 40;
        categoryName = "Existing Category";
        parentFolderID = 1;
        doesCategoryExistStub = sinon.stub(Category, "_doesCategoryExist")
            .withArgs(categoryName)
            .returns(true);
        saveCategoryStub = sinon.stub(Category, "_saveCategoryInDb")
            .withArgs(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
        doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
            .withArgs(parentFolderID)
            .returns(true);
    });
    it("should add category when depreciation type is double declining with no depreciation value", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test input values
            depreciaitionType = "Double Declining Balance";
            depreciationPercentage = null;
            yield assertThatCategoryConstructorSucceds();
        });
    });
    it("should add category when depreciation type is written value with a depreciation value", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield assertThatCategoryConstructorSucceds();
        });
    });
    it("should bring an error when any of category details are missing", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test input values
            categoryName = null;
            yield assertThatCategotyConstructorFails("Missing Information");
        });
    });
    it("should bring an error when a category already exists", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            categoryName = "existing";
            Category._doesCategoryExist.restore();
            doesCategoryExistStub = sinon.stub(Category, "_doesCategoryExist")
                .withArgs(categoryName)
                .returns(false);
            yield assertThatCategotyConstructorFails("Category Already Exists");
        });
    });
    it("should bring an error if the parent folder does not exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            parentFolderID = 1000;
            Folder.doesFolderExist.restore();
            doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
                .withArgs(parentFolderID)
                .returns(false);
            yield assertThatCategotyConstructorFails("Parent Folder Does Not Exist");
        });
    });
    it("should bring an error if depreciation type is invalid", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            depreciaitionType = "None Existent Type";
            yield assertThatCategotyConstructorFails("Invalid Depreciation Type");
        });
    });
    it("should bring an error if double declining or straight line balance has a depreciation value", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            depreciaitionType = "Double Declining Balance";
            depreciationPercentage = 200;
            yield assertThatCategotyConstructorFails("There should be no depreciation percentage");
        });
    });
    it("should bring an error if written value does not have a depreciation percentage", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            depreciaitionType = "Written Down Value";
            depreciationPercentage = null;
            yield assertThatCategotyConstructorFails("Invalid Depreciation Percentage");
        });
    });
    it("should bring an error if written value has a negative depreciation percentage", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            depreciaitionType = "Written Down Value";
            depreciationPercentage = -10;
            yield assertThatCategotyConstructorFails("Invalid Depreciation Percentage");
        });
    });
});
// Removes wrappers before each test
afterEach(function () {
    sinon.restore();
});
