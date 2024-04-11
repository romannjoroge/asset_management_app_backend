import { Errors, MyErrors2 } from '../../utility/constants.js';
import MyError from '../../utility/myError.js';
import Asset, { DepreciationTypes } from './asset2.js'
import assetTable from './db_assets.js';
import pool from '../../../db2.js';
import getResultsFromDatabase from '../../utility/getResultsFromDatabase.js';
import { getStraightLineDepreciationScheduleEntries } from './straight-line-depreciation.js';
import { getWrittenDownValueDepreciationScheduleEntries } from './written-down-value-depreciation.js';
import { getDoubleDecliningBalanceDepreciationEntries } from './double-declining-balance-depreciation.js';

export const createDepreciationSchedules = async (barcode: string): Promise<void | never> => {
    return new Promise((res, rej) => {
        // Get assetID from barcode
        Asset._getAssetID(barcode).then((assetID) => {
            // Get Depreciation Schedule Entries
            createDeprecaitonScheduleEntries(assetID).then((depreciationScheduleEntries) => {
                let promises: Promise<void>[] = [];
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
}

// Function assumes that asset with asset ID exists
function getAssetDepreciationType(assetID: number): Promise<DepreciationTypes> {
    return new Promise((res, rej) => {
        let query = "SELECT depreciationtype FROM Category WHERE id = (SELECT categoryid FROM Asset WHERE assetid = $1 LIMIT 1)";
        getResultsFromDatabase<{ depreciationtype: string }>(query, [assetID]).then((data) => {
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
            .catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_TYPE_OF_ASSET));
            })
    })
}

interface AssetDepreciationDetails {
    lifespan: number;
    acquisitiondate: Date,
    depreciation_percentage?: number,
    residualvalue?: number,
    acquisitioncost: number
}

// Function assumes that asset with asset ID exists
export function getAssetDepreciationDetails(assetID: number): Promise<AssetDepreciationDetails> {
    return new Promise((res, rej) => {
        let query = "SELECT usefullife as lifespan, acquisitiondate, residualvalue, acquisitioncost, d.percentage AS depreciation_percentage FROM Asset a LEFT JOIN DepreciationPercent d ON d.categoryid = a.categoryid WHERE assetID = $1"
        getResultsFromDatabase<AssetDepreciationDetails>(query, [assetID]).then(data => {
            if (data.length <= 0) {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_DETAILS))
            }

            return res(data[0]);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_DETAILS));
        })
    })
}



export const createDeprecaitonScheduleEntries = (assetID: number): Promise<DepreciaitionScheduleEntry[] | never> => {
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
                    }).catch((err: MyError) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    })
                } else if (depType === DepreciationTypes.StraightLine) {
                    getStraightLineDepreciationScheduleEntries(assetID).then(depreciationScheduleEntries => {
                        return res(depreciationScheduleEntries);
                    }).catch((err: MyError) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    })
                } else if (depType === DepreciationTypes.DoubleDecliningBalance) {
                    getDoubleDecliningBalanceDepreciationEntries(assetID).then(depEntries => {
                        return res(depEntries);
                    }).catch((err: MyError) => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
                    })
                } else {
                    console.log(depType)
                    return rej(new MyError(Errors[50]));
                }
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE))
            })
        })
    });
}

export interface DepreciaitionScheduleEntry {
    year: number,
    assetid: number,
    openingbookvalue: number,
    depreciationexpense: number,
    accumulateddepreciation: number,
    closingbookvalue: number
}

async function insertDepreciationSchedule(props: DepreciaitionScheduleEntry): Promise<void | never> {
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