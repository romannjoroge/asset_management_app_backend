import { assert } from "chai";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { getGenerateReportStruct, checkIfWayItemIsFilteredIsValid, isFilterFieldValid } from "./generated_report_helpers.js";
import { ItemsThatDontNeedJoin, ItemsThatNeedJoin, GenerateReportStruct, SupportedGenerateAssetReportFields, WaysToFilterBy } from "./generated_report_types.js";
import { generateSelectStatementFromGenerateReportStruct } from "./generateReport.js";
import utility from "../utility/utility.js";

// async function test2() {
//     try {
//         await storeGenerateReportStatement([SupportedGenerateAssetReportFields.ACQUISITION_COST], "Test Report", "monthly", 6);
//         console.log("Done");
//     } catch(err) {
//         console.log("OHH SHIT", err);
//     }
// }

// test2();

async function test() {
    let listWithUnsupportedField = ['height', 'barcode'];

    try {
        let result = getGenerateReportStruct(listWithUnsupportedField);
        console.log("Test Failed Error Meant To Be Thrown");
    } catch(err) {
        if (err instanceof MyError && err.message === MyErrors2.NOT_GET_GENERATE_REPORT_STRUCT) {
            console.log("TEST 1: PASSED")
        } else {
            console.log("TEST 1: FAILED", err);
        }
    }

    let listWithItemsThatDontNeedJoin = ItemsThatDontNeedJoin

    try {
        let result = getGenerateReportStruct(listWithItemsThatDontNeedJoin);
        assert.deepEqual(result, {
            fieldsThatDontNeedJoin: ItemsThatDontNeedJoin,
            fieldsThatNeedJoin: []
        }, "Wrong item returned");
        console.log("TEST 2: PASSED")
    } catch(err) {
        console.log("TEST 2: FAILED", err);
    }

    let emptylistWithItemsThatDontNeedJoin: string[] = [];
    try {
        let result = getGenerateReportStruct(emptylistWithItemsThatDontNeedJoin);
        assert.deepEqual(result, {
            fieldsThatDontNeedJoin: [],
            fieldsThatNeedJoin: []
        }, "Wrong item returned");
        console.log("TEST 3: PASSED")
    } catch(err) {
        console.log("TEST 3: FAILED", err);
    }

    let listWithItemsThatNeedJoin = ItemsThatNeedJoin

    try {
        let result = getGenerateReportStruct(listWithItemsThatNeedJoin);
        assert.deepEqual(result, {
            fieldsThatDontNeedJoin: [],
            fieldsThatNeedJoin: ItemsThatNeedJoin
        }, "Wrong item returned");
        console.log("TEST 4: PASSED")
    } catch(err) {
        console.log("TEST 4: FAILED", err);
    }

    let emptylistWithItemsThatNeedJoin: string[] = [];
    try {
        let result = getGenerateReportStruct(emptylistWithItemsThatNeedJoin);
        assert.deepEqual(result, {
            fieldsThatDontNeedJoin: [],
            fieldsThatNeedJoin: []
        }, "Wrong item returned");
        console.log("TEST 5: PASSED")
    } catch(err) {
        console.log("TEST 5: FAILED", err);
    }

    let listWithBothNeedAndNotNeedJoin: string[] = [];
    listWithBothNeedAndNotNeedJoin = listWithBothNeedAndNotNeedJoin.concat(ItemsThatDontNeedJoin);
    listWithBothNeedAndNotNeedJoin = listWithBothNeedAndNotNeedJoin.concat(ItemsThatNeedJoin);

    try {
        let result = getGenerateReportStruct(listWithBothNeedAndNotNeedJoin);
        assert.deepEqual(result, {
            fieldsThatDontNeedJoin: ItemsThatDontNeedJoin,
            fieldsThatNeedJoin: ItemsThatNeedJoin
        }, "Wrong item returned");
        console.log("TEST 6: PASSED")
    } catch(err) {
        console.log("TEST 6: FAILED", err);
    }

    let generateReportStruct: GenerateReportStruct = {fieldsThatDontNeedJoin: [SupportedGenerateAssetReportFields.ACQUISITION_COST], fieldsThatNeedJoin: []};
    try {
        let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct).statement;
        assert.equal(
            result,
            `SELECT a.${SupportedGenerateAssetReportFields.ACQUISITION_COST} FROM Asset a`,
            "Wrong Statement Returned"
        );
        console.log("TEST 7: PASSED");
    } catch(err) {
        console.log("TEST 7: FAILED", err);
    }

    let generateReportStruct2: GenerateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: []};
    try {
        let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct2).statement;
        assert.equal(
            result,
            `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION} FROM Asset a`,
            "Wrong Statement Returned"
        );
        console.log("TEST 8: PASSED");
    } catch(err) {
        console.log("TEST 8: FAILED", err);
    }

    let generateReportStruct3: GenerateReportStruct = {fieldsThatDontNeedJoin: [], fieldsThatNeedJoin: [SupportedGenerateAssetReportFields.CATEGORY]};
    try {
        let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct3).statement;
        assert.equal(
            result,
            `SELECT c.name AS category FROM Asset a INNER JOIN Category c ON c.id = a.categoryid`,
            "Wrong Statement Returned"
        );
        console.log("TEST 9: PASSED");
    } catch(err) {
        console.log("TEST 9: FAILED", err);
    }

    let generateReportStruct4: GenerateReportStruct = {fieldsThatDontNeedJoin: [], fieldsThatNeedJoin: ItemsThatNeedJoin};
    try {
        let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct4).statement;
        assert(
            result === `SELECT c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid`|| result === `SELECT c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid `, 
            "Wrong Statement Returned"
        );
        console.log("TEST 10: PASSED");
    } catch(err) {
        console.log("TEST 10: FAILED", err);
    }

    let generateReportStruct5: GenerateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: ItemsThatNeedJoin};
    try {
        let result = generateSelectStatementFromGenerateReportStruct(generateReportStruct5).statement;
        assert(
            result === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid`|| result === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid `, 
            "Wrong Statement Returned"
        );
        console.log("TEST 11: PASSED");
    } catch(err) {
        console.log("TEST 11: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({to: '12-12-2024', from: '11-10-2024'}, WaysToFilterBy.DATE_RANGE);
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 12: PASSED");
    } catch(err) {
        console.log("TEST 12: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({asdfadsfo: '12-12-2024', adfasf: '11-10-2024'}, WaysToFilterBy.DATE_RANGE);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 13: PASSED");
    } catch(err) {
        console.log("TEST 13: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({}, WaysToFilterBy.DATE_RANGE);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 14: PASSED");
    } catch(err) {
        console.log("TEST 14: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid(false, WaysToFilterBy.BOOLEAN);
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 15: PASSED");
    } catch(err) {
        console.log("TEST 15: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({}, WaysToFilterBy.BOOLEAN);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 16: PASSED");
    } catch(err) {
        console.log("TEST 16: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({}, WaysToFilterBy.ID);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 17: PASSED");
    } catch(err) {
        console.log("TEST 17: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid(-2, WaysToFilterBy.ID);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 18: PASSED");
    } catch(err) {
        console.log("TEST 18: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid(2, WaysToFilterBy.ID);
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 19: PASSED");
    } catch(err) {
        console.log("TEST 19: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({to: 12, from: 40}, WaysToFilterBy.NUMBER_RANGE);
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 20: PASSED");
    } catch(err) {
        console.log("TEST 20: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({to: 12}, WaysToFilterBy.NUMBER_RANGE);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 21: PASSED");
    } catch(err) {
        console.log("TEST 21: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid({to: 12}, WaysToFilterBy.STRING);
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 22: PASSED");
    } catch(err) {
        console.log("TEST 22: FAILED", err);
    }

    try {
        let result = checkIfWayItemIsFilteredIsValid("ge", WaysToFilterBy.STRING);
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 23: PASSED");
    } catch(err) {
        console.log("TEST 23: FAILED", err);
    }

    try {
        let result = isFilterFieldValid({residualvalue: {to: 12, from: 40}});
        assert(
            result === true, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 24: PASSED");
    } catch(err) {
        console.log("TEST 24: FAILED", err);
    }

    try {
        let result = isFilterFieldValid({residualvalue: 1});
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 25: PASSED");
    } catch(err) {
        console.log("TEST 25: FAILED", err);
    }

    try {
        let result = isFilterFieldValid({sdfasdf: 1});
        assert(
            result === false, 
            `Wrong Result Returned: ${result}`
        );
        console.log("TEST 26: PASSED");
    } catch(err) {
        console.log("TEST 26: FAILED", err);
    }

    generateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: ItemsThatNeedJoin, filterFields: {category: 1}};
    try {
        let {statement, args} = generateSelectStatementFromGenerateReportStruct(generateReportStruct);
        assert(
            statement === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid WHERE c.id = $1`, 
            `Wrong Statement Returned ${statement}`
        );

        assert.deepEqual(
            args,
            [1],
            "Wrong Args Returned"
        )
        console.log("TEST 27: PASSED");
    } catch(err) {
        console.log("TEST 27: FAILED", err);
    }

    let toDateString = '12-12-2024';
    let toDate = utility.checkIfValidDate(toDateString, "Invalid Date");
    let fromDateString = '11-10-2024';
    let fromDate = utility.checkIfValidDate(fromDateString, "Invalid Date");
    generateReportStruct = {fieldsThatDontNeedJoin: ItemsThatDontNeedJoin, fieldsThatNeedJoin: ItemsThatNeedJoin, filterFields: {category: 1, responsible_user: 1, disposaldate: {to: toDateString, from: fromDateString}}};
    try {
        let {statement, args} = generateSelectStatementFromGenerateReportStruct(generateReportStruct);
        assert(
            statement === `SELECT a.${SupportedGenerateAssetReportFields.SERIAL_NUMBER}, a.${SupportedGenerateAssetReportFields.ACQUISITION_DATE}, a.${SupportedGenerateAssetReportFields.ACQUISITION_COST}, a.${SupportedGenerateAssetReportFields.RESIDUAL_VALUE}, a.${SupportedGenerateAssetReportFields.USEFUL_LIFE}, a.${SupportedGenerateAssetReportFields.BARCODE}, a.${SupportedGenerateAssetReportFields.DESCRIPTION}, a.${SupportedGenerateAssetReportFields.DISPOSAL_DATE}, a.${SupportedGenerateAssetReportFields.ISCONVERTED}, a.${SupportedGenerateAssetReportFields.CONDITION}, c.name AS category, l.name AS location_name, u.username AS responsible_user, c.depreciationtype AS depreciationtype FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN Location l ON l.id = a.locationid INNER JOIN User2 u ON u.id = a.responsibleuserid WHERE c.id = $1 AND WHERE u.id = $2 AND disposaldate BETWEEN $3 AND $4`, 
            `Wrong Statement Returned ${statement}`
        );

        assert.deepEqual(
            args,
            [1, 1, fromDate, toDate],
            "Wrong Args Returned"
        )
        console.log("TEST 28: PASSED");
    } catch(err) {
        console.log("TEST 28: FAILED", err);
    }
}

test();
