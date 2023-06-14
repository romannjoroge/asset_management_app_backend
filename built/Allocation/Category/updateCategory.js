import Category from "./category2.js";
import categoryTable from "./db_category2.js";
import MyError from "../../utility/myError.js";
import { Errors } from "../../utility/constants.js";
import pool from "../../../db2.js";
import { DepreciationTypes } from "../Asset/asset2.js";
export default function updateCategory(categoryID, updateJSON) {
    // Update whatever item is specified in json
    /*
    json: an object that could have the following keys: name, parentFolder or depreciaiton
    Each key contains the new info to use to update that property of a category.
    The depreciation key contains another object that has depreciation type and value
    */
    // Return an error if categoryID doesn't exist
    return new Promise((res, rej) => {
        Category._doesCategoryIDExist(categoryID).then((doesCategExist) => {
            if (doesCategExist === false) {
                return rej(new MyError(Errors[5]));
            }
            let promises = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises.push(updateItems({ [key2]: value })));
            Promise.all(promises).then(() => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
            function updateItems(props) {
                return new Promise((res, rej) => {
                    if ("name" in props) {
                        if (props.name === undefined) {
                            return rej(new MyError(Errors[53]));
                        }
                        _updateCategoryName(props.name, categoryID).then(() => {
                            return res();
                        }).catch(err => {
                            if (err instanceof MyError) {
                                return rej(err);
                            }
                            else {
                                return rej(new MyError(Errors[9]));
                            }
                        });
                    }
                    if ("parentcategoryid" in props) {
                        if (props.parentcategoryid === undefined) {
                            return rej(new MyError(Errors[53]));
                        }
                        _updateParentCategory(props.parentcategoryid, categoryID).then(() => {
                            return res();
                        }).catch(err => {
                            if (err instanceof MyError) {
                                return rej(err);
                            }
                            else {
                                return rej(new MyError(Errors[9]));
                            }
                        });
                    }
                    if ("depreciationtype" in props) {
                        if (props.depreciationtype === undefined) {
                            return rej(new MyError(Errors[53]));
                        }
                        _updateDepreciationType(props.depreciationtype, categoryID).then(() => {
                            return res();
                        }).catch(err => {
                            if (err instanceof MyError) {
                                return rej(err);
                            }
                            else {
                                return rej(new MyError(Errors[9]));
                            }
                        });
                    }
                });
            }
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
function _updateDepreciationType(props, categoryID) {
    return new Promise((res, rej) => {
        try {
            // Verify Depreciation Details
            Category.verifyDepreciationDetails(props);
            // Update Depreciation Type in Category Table
            _updateInDb(categoryID, { depreciationtype: props }).then(() => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }
        catch (err) {
            return rej(err);
        }
    });
}
function _updateParentCategory(newParentID, categoryID) {
    return new Promise((res, rej) => {
        // Check if parent category exists
        Category._doesCategoryIDExist(newParentID).then(exist => {
            if (exist === false) {
                return rej(new MyError(Errors[5]));
            }
            // Update database
            _updateInDb(categoryID, { parentcategoryid: newParentID }).then(() => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
function _updateCategoryName(newName, categoryID) {
    return new Promise((res, rej) => {
        // Verify newName
        Category.verifyCategoryName(newName).then(() => {
            // Update database
            _updateInDb(categoryID, { name: newName }).then(() => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            if (err instanceof MyError) {
                return rej(err);
            }
            return rej(new MyError(Errors[9]));
        });
    });
}
function _updateInDb(categoryID, updateDetails) {
    // Update category in database
    return new Promise((res, rej) => {
        let updateQuery;
        if ("name" in updateDetails) {
            if (updateDetails.name === undefined) {
                return rej(new MyError(Errors[53]));
            }
            updateQuery = `UPDATE Category SET name = $1 WHERE id = $2`;
            pool.query(updateQuery, [updateDetails.name, categoryID]).then(_ => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }
        if ("parentcategoryid" in updateDetails) {
            if (updateDetails.parentcategoryid === undefined) {
                return rej(new MyError(Errors[53]));
            }
            else {
                updateQuery = `UPDATE Category SET parentCategoryID = $1 WHERE id = $2`;
                pool.query(updateQuery, [updateDetails.parentcategoryid, categoryID]).then(_ => {
                    return res();
                }).catch(err => {
                    return rej(new MyError(Errors[9]));
                });
            }
        }
        if ("depreciationtype" in updateDetails) {
            if (updateDetails.depreciationtype === undefined) {
                return rej(new MyError(Errors[53]));
            }
            else {
                updateQuery = `UPDATE Category SET depreciationType = $1 WHERE id = $2`;
                // Update Depreciation Type in Category Table
                pool.query(updateQuery, [updateDetails.depreciationtype.type, categoryID]).then(_ => {
                    // Delete Depreciation Percent in DepreciationPercent Table
                    pool.query(categoryTable.deleteDepreciationPercent, [categoryID]).then(_ => {
                        var _a;
                        // Insert Depreciation Percent in DepreciationPercent Table if Written Down Value
                        if (((_a = updateDetails.depreciationtype) === null || _a === void 0 ? void 0 : _a.type) === DepreciationTypes.WrittenDownValue) {
                            pool.query(categoryTable.insertDepreciationPercent, [categoryID, updateDetails.depreciationtype.value]).then(_ => {
                                return res();
                            }).catch(err => {
                                return rej(new MyError(Errors[9]));
                            });
                        }
                    }).catch(err => {
                        return rej(new MyError(Errors[9]));
                    });
                }).catch(err => {
                    return rej(new MyError(Errors[9]));
                });
            }
        }
    });
}
//# sourceMappingURL=updateCategory.js.map