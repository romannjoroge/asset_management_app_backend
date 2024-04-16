var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Errors, MyErrors2 } from '../../utility/constants.js';
import MyError from '../../utility/myError.js';
import Asset, { DepreciationTypes } from './asset2.js';
import assetTable from './db_assets.js';
import pool from '../../../db2.js';
import getResultsFromDatabase from '../../utility/getResultsFromDatabase.js';
import { getStraightLineDepreciationScheduleEntries } from './straight-line-depreciation.js';
import { getWrittenDownValueDepreciationScheduleEntries } from './written-down-value-depreciation.js';
import { getDoubleDecliningBalanceDepreciationEntries } from './double-declining-balance-depreciation.js';
export const createDepreciationSchedules = (barcode) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((res, rej) => {
        // Get assetID from barcode
        Asset._getAssetID(barcode).then((assetID) => {
            // Get Depreciation Schedule Entries
            createDeprecaitonScheduleEntries(assetID).then((depreciationScheduleEntries) => {
                let promises = [];
                for (var i in depreciationScheduleEntries) {
                    promises.push(insertDepreciationSchedule(depreciationScheduleEntries[i]));
                }
                Promise.all(promises).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[48]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[48]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[29]));
        });
    });
});
// Function assumes that asset with asset ID exists
function getAssetDepreciationType(assetID) {
    return new Promise((res, rej) => {
        let query = "SELECT depreciationtype FROM Category WHERE id = (SELECT categoryid FROM Asset WHERE assetid = $1 LIMIT 1)";
        getResultsFromDatabase(query, [assetID]).then((data) => {
            if (data.length <= 0) {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_TYPE_OF_ASSET));
            }
            switch (data[0].depreciationtype) {
                case "Written Down Value":
                    return res(DepreciationTypes.WrittenDownValue);
                case "Double Declining Balance":
                    return res(DepreciationTypes.DoubleDecliningBalance);
                case "Straight Line":
                    return res(DepreciationTypes.StraightLine);
                default:
                    return rej(new MyError(MyErrors2.INVALID_DEPRECIATION_TYPE));
            }
        })
            .catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_TYPE_OF_ASSET));
        });
    });
}
// Function assumes that asset with asset ID exists
export function getAssetDepreciationDetails(assetID) {
    return new Promise((res, rej) => {
        let query = "SELECT usefullife as lifespan, acquisitiondate, residualvalue, acquisitioncost, d.percentage AS depreciation_percentage FROM Asset a LEFT JOIN DepreciationPercent d ON d.categoryid = a.categoryid WHERE assetID = $1";
        getResultsFromDatabase(query, [assetID]).then(data => {
            if (data.length <= 0) {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_DETAILS));
            }
            return res(data[0]);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_DETAILS));
        });
    });
}
export const createDeprecaitonScheduleEntries = (assetID) => {
    return new Promise((res, rej) => {
        // Reject if asset does not exist
        Asset._doesAssetIDExist(assetID).then((doesExist) => {
            if (doesExist === false) {
                rej(new MyError(Errors[29]));
            }
            getAssetDepreciationType(assetID).then(depType => {
                if (depType === DepreciationTypes.WrittenDownValue) {
                    getWrittenDownValueDepreciationScheduleEntries(assetID).then(depreciationEntries => {
                        return res(depreciationEntries);
                    }).catch((err) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    });
                }
                else if (depType === DepreciationTypes.StraightLine) {
                    getStraightLineDepreciationScheduleEntries(assetID).then(depreciationScheduleEntries => {
                        return res(depreciationScheduleEntries);
                    }).catch((err) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    });
                }
                else if (depType === DepreciationTypes.DoubleDecliningBalance) {
                    getDoubleDecliningBalanceDepreciationEntries(assetID).then(depEntries => {
                        return res(depEntries);
                    }).catch((err) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    });
                }
                else {
                    console.log(depType);
                    return rej(new MyError(Errors[50]));
                }
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
            });
        });
    });
};
function insertDepreciationSchedule(props) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            // Inserts data in props into the depreciation schedule table
            pool.query(assetTable.insertDepreciationSchedule, [props.year, props.assetid,
                props.openingbookvalue, props.depreciationexpense, props.accumulateddepreciation,
                props.closingbookvalue]).then(_ => {
                res();
            }).catch(err => {
                console.log(err);
                rej(new MyError(Errors[48]));
            });
        });
    });
}
// async function test() {
//     try {
//         let depEntries = await createDeprecaitonScheduleEntries(12);
//         console.log(depEntries);
//     } catch(err) {
//         console.log("OHH SHIT", err);
//     }
// }
// test();
//# sourceMappingURL=depreciations.js.map