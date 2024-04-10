import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { assert } from "chai";

enum SupportedGenerateAssetReportFields {
    SERIAL_NUMBER = "serialnumber",
    ACQUISITION_DATE = "acquisitiondate",
    CONDITION = "condition",
    ACQUISITION_COST = "acquisitioncost",
    RESIDUAL_VALUE = "residualvalue",
    CATEGORY = "category",
    USEFUL_LIFE = "usefullife",
    BARCODE = "barcode",
    DESCRIPTION = "description",
    LOCATION = "location",
    DISPOSAL_DATE = "disposaldate",
    DEPRECIATION_TYPE = "depreciationtype",
    RESPONSIBLE_USER = "responsible_user",
    ISCONVERTED = "isconverted"
}

enum GenerateAssetReportTimePeriods {
    MONTHLY = "monthly",
    QUATERLY = "quaterly",
    ANNUALY = "annualy"
}

const ItemsThatNeedJoin = [
    SupportedGenerateAssetReportFields.CATEGORY,
    SupportedGenerateAssetReportFields.LOCATION,
    SupportedGenerateAssetReportFields.RESPONSIBLE_USER,
    SupportedGenerateAssetReportFields.DEPRECIATION_TYPE,
]

const ItemsThatDontNeedJoin = [
    SupportedGenerateAssetReportFields.SERIAL_NUMBER,
    SupportedGenerateAssetReportFields.ACQUISITION_DATE,
    SupportedGenerateAssetReportFields.ACQUISITION_COST,
    SupportedGenerateAssetReportFields.RESIDUAL_VALUE,
    SupportedGenerateAssetReportFields.USEFUL_LIFE,
    SupportedGenerateAssetReportFields.BARCODE,
    SupportedGenerateAssetReportFields.DESCRIPTION,
    SupportedGenerateAssetReportFields.DISPOSAL_DATE,
    SupportedGenerateAssetReportFields.ISCONVERTED,
    SupportedGenerateAssetReportFields.CONDITION
];

interface GeneratedAssetReportType {
    serialnumber?: string,
    acquisitiondate?: string,
    condition?: string,
    acquisitioncost?: number,
    residualvalue?: number,
    category?: string,
    usefullife?: number,
    barcode?: string,
    description?: string,
    // site?: string,
    // building?: string,
    // office?: string,
    location_name?: string,
    disposaldate?: string,
    depreciationtype?: string,
    responsible_user?: string,
    isconverted?: boolean
}

interface GenerateReportStruct {
    fieldsThatDontNeedJoin: string[],
    fieldsThatNeedJoin: string[]
}

export function storeGenerateReportStatement(items: string[], name: string, period: string, creator_id: number): Promise<void> {
    return new Promise((res, rej) => {
        // If time period not supported throw error
        //@ts-ignore
        if (Object.values(GenerateAssetReportTimePeriods).includes(period) === false) {
            return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
        }

        // If items contains an item that is not in supported types return error
        for (let i of items) {
            //@ts-ignore
            if (Object.values(SupportedGenerateAssetReportFields).includes(i) == false) {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            }
        }

        User.checkIfUserIDExists(creator_id).then((creator_exists) => {            
            if (!creator_exists) {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            }

            let generateReportStruct = getGenerateReportStruct(items);

            let query = "INSERT INTO GenerateReports (name, period, creator_id, report) VALUES ($1, $2, $3, $4)"
            pool.query(query, [name, period, creator_id, generateReportStruct]).then(() => {
                return res();
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            });
        })
    });
}

function getGenerateReportStruct(items: string[]): GenerateReportStruct {
    try {
        let generateReportStruct: GenerateReportStruct = {fieldsThatDontNeedJoin: [], fieldsThatNeedJoin: []};

        // For items that do not need joins just add to select statement
        for (let i of items) {
            //@ts-ignore
            if (ItemsThatDontNeedJoin.includes(i)) {
                generateReportStruct.fieldsThatDontNeedJoin.push(i);
            } else {
                //@ts-ignore
                if (ItemsThatNeedJoin.includes(i)) {
                    generateReportStruct.fieldsThatNeedJoin.push(i);
                }
            }
        }

        return generateReportStruct;
    } catch(err) {
        throw new MyError(MyErrors2.NOT_GET_GENERATE_REPORT_STRUCT);
    }
}

function getSelectFromField(field: string): string {
    try {
        if (field === SupportedGenerateAssetReportFields.LOCATION) {
            return "l.name AS location_name"
        } else if (field === SupportedGenerateAssetReportFields.CATEGORY) {
            return "c.name AS category"
        } else if (field === SupportedGenerateAssetReportFields.RESPONSIBLE_USER) {
            return "u.username AS responsible_user"
        } else if (field === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
            return "c.depreciationtype AS depreciationtype"
        } else {
            throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
        }
    } catch(err) {
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}

function getSelectInnerJoinFromField(field: string): string {
    try {
        if (field === SupportedGenerateAssetReportFields.LOCATION) {
            return "INNER JOIN Location l ON l.id = a.locationid"
        } else if (field === SupportedGenerateAssetReportFields.CATEGORY || field == SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
            return "INNER JOIN Category c ON c.id = a.categoryid"
        } else if (field === SupportedGenerateAssetReportFields.RESPONSIBLE_USER) {
            return "INNER JOIN User2 u ON u.id = a.responsibleuserid"
        } else {
            throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
        }
    } catch(err) {
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}

function generateSelectStatementFromGenerateReportStruct(struct: GenerateReportStruct): string {
    try {
        // If struct is empty return empty string
        if (struct.fieldsThatDontNeedJoin.length === 0 && struct.fieldsThatNeedJoin.length === 0) {
            return "";
        }

        // Items that don't need join segment
        let itemsThatDontNeedJoinSegment = "";
        if (struct.fieldsThatDontNeedJoin.length == 1) {
            itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[0]}`;
        } else if (struct.fieldsThatDontNeedJoin.length > 1) {
            for (let i = 0; i < struct.fieldsThatDontNeedJoin.length; i++) {
                if (i == 0) {
                    itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[i]}, `;
                } else if (i == struct.fieldsThatDontNeedJoin.length - 1) {
                    itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[i]}`;
                } else {
                    itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[i]}, `;
                }
            }
        }

        // Items that need join
        let itemsThatNeedJoinSegment = "";
        let innerJoinSegment = "";
        if (struct.fieldsThatNeedJoin.length === 1) {
            itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + getSelectFromField(struct.fieldsThatNeedJoin[0]);
            innerJoinSegment = innerJoinSegment + getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[0]);
        } else {
            let seenCategory = false;
            let dontAddInnerJoin = false;
            for (let i = 0; i < struct.fieldsThatNeedJoin.length; i++) {
                if (seenCategory) {
                    if (struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.CATEGORY || struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
                        dontAddInnerJoin = true
                    }
                }

                if (struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.CATEGORY || struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
                    seenCategory = true
                }

                if (i == 0) {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[0])}, `;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[0])} `;
                    }
                    
                } else if (i == struct.fieldsThatNeedJoin.length - 1) {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[i])}`;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[i])}`;
                    }

                } else {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[i])}, `;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[i])} `;
                    }
                }
            }
        }

        let selectStatement: string;
        if (struct.fieldsThatNeedJoin.length === 0) {
            selectStatement =  `SELECT ${itemsThatDontNeedJoinSegment} FROM Asset a`;
        } else if (struct.fieldsThatDontNeedJoin.length === 0) {
            selectStatement = `SELECT ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`
        } else {
            selectStatement = `SELECT ${itemsThatDontNeedJoinSegment}, ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`;
        }
        console.log(selectStatement);
        return selectStatement;
    } catch(err) {
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}

async function test2() {
    try {
        await storeGenerateReportStatement([SupportedGenerateAssetReportFields.ACQUISITION_COST], "Test Report", "monthly", 6);
        console.log("Done");
    } catch(err) {
        console.log("OHH SHIT", err);
    }
}

test2();

// async function test() {
//     let listWithUnsupportedField = ['height', 'barcode'];

//     try {
//         let result = await generateReport(listWithUnsupportedField);
//         console.log("Test Failed Error Meant To Be Thrown");
//     } catch(err) {
//         if (err instanceof MyError && err.message === MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED) {
//             console.log("TEST 1: PASSED")
//         } else {
//             console.log("TEST 2: FAILED", err);
//         }
//     }

//     let listWithItemsThatDontNeedJoin = ItemsThatDontNeedJoin

//     try {
//         let result = getGenerateReportStruct(listWithItemsThatDontNeedJoin);
//         assert.deepEqual(result, {
//             fieldsThatDontNeedJoin: ItemsThatDontNeedJoin,
//             fieldsThatNeedJoin: []
//         }, "Wrong item returned");
//         console.log("TEST 2: PASSED")
//     } catch(err) {
//         console.log("TEST 2: FAILED", err);
//     }

//     let emptylistWithItemsThatDontNeedJoin: string[] = [];
//     try {
//         let result = getGenerateReportStruct(emptylistWithItemsThatDontNeedJoin);
//         assert.deepEqual(result, {
//             fieldsThatDontNeedJoin: [],
//             fieldsThatNeedJoin: []
//         }, "Wrong item returned");
//         console.log("TEST 3: PASSED")
//     } catch(err) {
//         console.log("TEST 3: FAILED", err);
//     }

//     let listWithItemsThatNeedJoin = ItemsThatNeedJoin

//     try {
//         let result = getGenerateReportStruct(listWithItemsThatNeedJoin);
//         assert.deepEqual(result, {
//             fieldsThatDontNeedJoin: [],
//             fieldsThatNeedJoin: ItemsThatNeedJoin
//         }, "Wrong item returned");
//         console.log("TEST 4: PASSED")
//     } catch(err) {
//         console.log("TEST 4: FAILED", err);
//     }

//     let emptylistWithItemsThatNeedJoin: string[] = [];
//     try {
//         let result = getGenerateReportStruct(emptylistWithItemsThatNeedJoin);
//         assert.deepEqual(result, {
//             fieldsThatDontNeedJoin: [],
//             fieldsThatNeedJoin: []
//         }, "Wrong item returned");
//         console.log("TEST 5: PASSED")
//     } catch(err) {
//         console.log("TEST 5: FAILED", err);
//     }

//     let listWithBothNeedAndNotNeedJoin: string[] = [];
//     listWithBothNeedAndNotNeedJoin = listWithBothNeedAndNotNeedJoin.concat(ItemsThatDontNeedJoin);
//     listWithBothNeedAndNotNeedJoin = listWithBothNeedAndNotNeedJoin.concat(ItemsThatNeedJoin);

//     try {
//         let result = getGenerateReportStruct(listWithBothNeedAndNotNeedJoin);
//         assert.deepEqual(result, {
//             fieldsThatDontNeedJoin: ItemsThatDontNeedJoin,
//             fieldsThatNeedJoin: ItemsThatNeedJoin
//         }, "Wrong item returned");
//         console.log("TEST 6: PASSED")
//     } catch(err) {
//         console.log("TEST 6: FAILED", err);
//     }

//     let generateReportStruct: GenerateReportStruct = {fieldsThatDontNeedJoin: [SupportedGenerateAssetReportFields.ACQUISITION_COST], fieldsThatNeedJoin: []};
//     try {
//         let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct);
//         assert.equal(
//             result,
//             `SELECT a.${SupportedGenerateAssetReportFields.ACQUISITION_COST} FROM Asset a`,
//             "Wrong Statement Returned"
//         );
//         console.log("TEST 7: PASSED");
//     } catch(err) {
//         console.log("TEST 7: FAILED", err);
//     }

//     let generateReportStruct2: GenerateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: []};
//     try {
//         let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct2);
//         assert.equal(
//             result,
//             `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION} FROM Asset a`,
//             "Wrong Statement Returned"
//         );
//         console.log("TEST 8: PASSED");
//     } catch(err) {
//         console.log("TEST 8: FAILED", err);
//     }

//     let generateReportStruct3: GenerateReportStruct = {fieldsThatDontNeedJoin: [], fieldsThatNeedJoin: [SupportedGenerateAssetReportFields.CATEGORY]};
//     try {
//         let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct3);
//         assert.equal(
//             result,
//             `SELECT c.name AS category FROM Asset a INNER JOIN Category c ON c.id = a.categoryid`,
//             "Wrong Statement Returned"
//         );
//         console.log("TEST 9: PASSED");
//     } catch(err) {
//         console.log("TEST 9: FAILED", err);
//     }

//     let generateReportStruct4: GenerateReportStruct = {fieldsThatDontNeedJoin: [], fieldsThatNeedJoin: ItemsThatNeedJoin};
//     try {
//         let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct4);
//         assert(
//             result === `SELECT c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid`|| result === `SELECT c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid `, 
//             "Wrong Statement Returned"
//         );
//         console.log("TEST 10: PASSED");
//     } catch(err) {
//         console.log("TEST 10: FAILED", err);
//     }

//     let generateReportStruct5: GenerateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: ItemsThatNeedJoin};
//     try {
//         let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct5);
//         assert(
//             result === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid`|| result === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid `, 
//             "Wrong Statement Returned"
//         );
//         console.log("TEST 11: PASSED");
//     } catch(err) {
//         console.log("TEST 11: FAILED", err);
//     }
// }

// test();