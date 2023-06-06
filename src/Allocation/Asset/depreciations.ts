import { Errors } from '../../utility/constants.js';
import MyError from '../../utility/myError.js';
import Asset, { DepreciationTypes } from './asset2.js'
import assetTable from './db_assets.js';
import pool from '../../../db2.js';


interface DepreciationDetails {
    usefullife: number,
    acquisitiondate: Date,
    acquisitioncost: number,
    percentage?: number,
    residualvalue: number
}

interface DepreciationDetailFetchResults{
    rowCount: number
    rows: DepreciationDetails[]
}

interface DepreciationType {
    assetdep: string | null,
    categdep: string
}

interface DepreciationTypeFetchResults{
    rowCount: number
    rows: DepreciationType[]
}
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


export const createDeprecaitonScheduleEntries = (assetID: number): Promise<DepreciaitionScheduleEntry[] | never> => {
    return new Promise((res, rej) => {
        // Reject if asset does not exist
        Asset._doesAssetIDExist(assetID).then((doesExist) => {
            if (doesExist === false) {
                rej(new MyError(Errors[29]));
            }

            // Get The Depreciation Type
            pool.query(assetTable.getDepreciationType, [assetID]).then((data: DepreciationTypeFetchResults) => {
                if (data.rowCount <= 0) {
                    return rej(new MyError(Errors[47]));
                } else {
                    let depType: string;
                    if (data.rows[0].assetdep) {
                        depType = data.rows[0].assetdep;
                    } else {
                        depType = data.rows[0].categdep;
                    }

                    let depreciationScheduleEntries: DepreciaitionScheduleEntry[] = [];

                    if (depType === DepreciationTypes.WrittenDownValue) {
                        // Get assets lifespan, acqusitionDate, depreciationPercentage and acquisitionCost
                        pool.query(assetTable.getDepreciationDetails, [assetID]).then((fetchResults: DepreciationDetailFetchResults) => {
                            if (fetchResults.rowCount === 0) {
                                rej(new MyError(Errors[8]));
                            } else {
                                let {usefullife, acquisitiondate, acquisitioncost, percentage} = fetchResults.rows[0];

                                if (percentage === undefined) {
                                    return rej(new MyError(Errors[50]));
                                }

                                let year = acquisitiondate.getFullYear();
                                let closingBookValue = 0;
                                let accumulatedDepreciation = 0;

                                let yearToAdd: number;
                                let openToAdd: number;
                                let depreciationExpense: number;
                                let accumDepToAdd: number;
                                let closeToAdd: number;


                                // Create depreciation schedule entries
                                for (let i = 0; i < usefullife; i++) {
                                    yearToAdd = year + i;

                                    // Opening book value is that of previous year
                                    if (yearToAdd == year) {
                                        openToAdd = acquisitioncost;
                                    } else {
                                        openToAdd = closingBookValue;
                                    }

                                    // Depreciation Expense is percentage of opening book value
                                    depreciationExpense = openToAdd * (percentage / 100);

                                    // Accumulated Depreciation is depreciation expense of previous year + depreciation expense of current year
                                    accumDepToAdd = accumulatedDepreciation + depreciationExpense;

                                    // Closing book value is opening book value - depreciation expense
                                    closeToAdd = openToAdd - depreciationExpense;

                                    let props: DepreciaitionScheduleEntry = {
                                        year: yearToAdd,
                                        assetid: assetID,
                                        openingbookvalue: openToAdd,
                                        depreciationexpense: depreciationExpense,
                                        accumulateddepreciation: accumDepToAdd,
                                        closingbookvalue: closeToAdd
                                    }
                                    // Insert Depreciation Details
                                    depreciationScheduleEntries.push(props);

                                    // Update values for next iteration
                                    closingBookValue = closeToAdd;
                                    accumulatedDepreciation = accumDepToAdd;
                                }

                                return res(depreciationScheduleEntries);
                            }
                        }).catch(err => {
                            console.log(err);
                            return rej(new MyError(Errors[48]));
                        });
                    } else if (depType === DepreciationTypes.StraightLine) {
                        // Get asset lifespan, acquisition Cost, residual value and acquisition date
                        pool.query(assetTable.getDepreciationDetails, [assetID]).then((fetchResults: DepreciationDetailFetchResults) => {
                            if (fetchResults.rowCount <= 0) {
                                return rej(new MyError(Errors[8]));
                            } else {
                                // Extract data from fetchResults
                                let {usefullife, acquisitiondate, acquisitioncost, residualvalue} = fetchResults.rows[0];

                                let year = acquisitiondate.getFullYear();
                                let closingBookValue: number;
                                let accumulatedDepreciation = 0;

                                let yearToAdd: number;
                                let openToAdd: number;
                                let depreciationExpense = (acquisitioncost - residualvalue) / usefullife;
                                // Compute depreciation schedule
                                for (var i = 0; i < usefullife; i++) {
                                    yearToAdd = year + i;

                                    // Getting opening book value
                                    if (i == 0) {
                                        openToAdd = acquisitioncost;
                                    } else {
                                        openToAdd = closingBookValue;
                                    }

                                    // Getting Accumulated Depreciation
                                    accumulatedDepreciation = accumulatedDepreciation + depreciationExpense;

                                    // Getting Closing Book Value
                                    closingBookValue = openToAdd - depreciationExpense;
                                    let props = {
                                        year: yearToAdd,
                                        assetid: assetID,
                                        openingbookvalue: openToAdd,
                                        depreciationexpense: depreciationExpense,
                                        accumulateddepreciation: accumulatedDepreciation,
                                        closingbookvalue: closingBookValue
                                    }
                                    depreciationScheduleEntries.push(props);
                                }

                                return res(depreciationScheduleEntries);
                            }
                        }).catch(err => {
                            console.log(err);
                            return rej(new MyError(Errors[48]));
                        });
                    } else if (depType === DepreciationTypes.DoubleDecliningBalance) {
                        // Get Depreciation Details
                        pool.query(assetTable.getDepreciationDetails, [assetID]).then((fetchResults: DepreciationDetailFetchResults) => {
                            if (fetchResults.rowCount <= 0) {
                                console.log(fetchResults.rows);
                                return rej(new MyError(Errors[8]));
                            } 

                            // Extract data from fetchResults
                            let {acquisitiondate, acquisitioncost, usefullife} = fetchResults.rows[0];

                            // Calculate needed values
                            let basicDepreciationValue = acquisitioncost / usefullife;
                            let basicDepreciationRate = (basicDepreciationValue / acquisitioncost)
                            
                            // Depreciation Schedule Value to keep track of 
                            let year = acquisitiondate.getFullYear();
                            let yearToAdd: number;
                            let openToAdd: number;
                            let depreciationExpense: number;
                            let accumDepToAdd = 0;
                            let closeToAdd: number;

                            for (var i = 0; i < usefullife; i++) {
                                yearToAdd = year + i;

                                // Open Book Value
                                if (i == 0) {
                                    openToAdd = acquisitioncost;
                                } else {
                                    openToAdd = closeToAdd;
                                }

                                // Depreciation Expense
                                depreciationExpense = 2 * basicDepreciationRate * openToAdd

                                // Accumulated Depreciation
                                accumDepToAdd = depreciationExpense + accumDepToAdd;

                                // Closing Book Value
                                closeToAdd = openToAdd - depreciationExpense;

                                let props = {
                                    year: yearToAdd,
                                    assetid: assetID,
                                    openingbookvalue: openToAdd,
                                    depreciationexpense: depreciationExpense,
                                    accumulateddepreciation: accumDepToAdd,
                                    closingbookvalue: closeToAdd
                                };

                                depreciationScheduleEntries.push(props);
                            }

                            return res(depreciationScheduleEntries);
                        }).catch(err => {
                            console.log(err);
                            return rej(new MyError(Errors[48]));
                        });
                    }else {
                        console.log(depType)
                        return rej(new MyError(Errors[50]));
                    }
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[47]));
            });
        })
    });
}

interface DepreciaitionScheduleEntry {
    year: number,
    assetid: number,
    openingbookvalue: number,
    depreciationexpense: number,
    accumulateddepreciation: number,
    closingbookvalue: number
}

async function insertDepreciationSchedule(props: DepreciaitionScheduleEntry): Promise<void | never>{
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