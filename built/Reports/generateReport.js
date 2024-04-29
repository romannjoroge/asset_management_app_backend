import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { SupportedGenerateAssetReportFields } from "./generated_report_types.js";
import { appendArguementsToArgs, getGenerateReportStruct, getSelectFromField, getSelectInnerJoinFromField, getWhereField, isFilterFieldValid } from "./generated_report_helpers.js";
import _ from "lodash";
const { isNull } = _;
export function storeGenerateReportStatement(struct, name, period, creator_id) {
    return new Promise((res, rej) => {
        // If time period not supported throw error
        //@ts-ignore
        if (Object.values(GenerateAssetReportTimePeriods).includes(period) === false) {
            return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
        }
        // If items contains an item that is not in supported types return error
        for (let i of struct.items) {
            //@ts-ignore
            if (Object.values(SupportedGenerateAssetReportFields).includes(i) == false) {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            }
        }
        User.checkIfUserIDExists(creator_id).then((creator_exists) => {
            if (!creator_exists) {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            }
            let generateReportStruct = getGenerateReportStruct(struct);
            let query = "INSERT INTO GenerateReports (name, period, creator_id, report) VALUES ($1, $2, $3, $4)";
            pool.query(query, [name, period, creator_id, generateReportStruct]).then(() => {
                return res();
            }).catch((err) => {
                return rej(new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED));
            });
        });
    });
}
export function generateSelectStatementFromGenerateReportStruct(struct) {
    try {
        // If struct is empty return empty string
        if (struct.fieldsThatDontNeedJoin.length === 0 && struct.fieldsThatNeedJoin.length === 0 && isNull(struct.filterFields)) {
            return { statement: "" };
        }
        // Items that don't need join segment
        let itemsThatDontNeedJoinSegment = "";
        if (struct.fieldsThatDontNeedJoin.length == 1) {
            itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[0]}`;
        }
        else if (struct.fieldsThatDontNeedJoin.length > 1) {
            for (let i = 0; i < struct.fieldsThatDontNeedJoin.length; i++) {
                if (i == 0) {
                    itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[i]}, `;
                }
                else if (i == struct.fieldsThatDontNeedJoin.length - 1) {
                    itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[i]}`;
                }
                else {
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
        }
        else {
            let seenCategory = false;
            let dontAddInnerJoin = false;
            for (let i = 0; i < struct.fieldsThatNeedJoin.length; i++) {
                if (seenCategory) {
                    if (struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.CATEGORY || struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
                        dontAddInnerJoin = true;
                    }
                }
                if (struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.CATEGORY || struct.fieldsThatNeedJoin[i] === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
                    seenCategory = true;
                }
                if (i == 0) {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[0])}, `;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[0])} `;
                    }
                }
                else if (i == struct.fieldsThatNeedJoin.length - 1) {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[i])}`;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[i])}`;
                    }
                }
                else {
                    itemsThatNeedJoinSegment = itemsThatNeedJoinSegment + `${getSelectFromField(struct.fieldsThatNeedJoin[i])}, `;
                    if (!dontAddInnerJoin) {
                        innerJoinSegment = innerJoinSegment + `${getSelectInnerJoinFromField(struct.fieldsThatNeedJoin[i])} `;
                    }
                }
            }
        }
        let selectStatement;
        if (struct.fieldsThatNeedJoin.length === 0) {
            selectStatement = `SELECT ${itemsThatDontNeedJoinSegment} FROM Asset a`;
        }
        else if (struct.fieldsThatDontNeedJoin.length === 0) {
            selectStatement = `SELECT ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`;
        }
        else {
            selectStatement = `SELECT ${itemsThatDontNeedJoinSegment}, ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`;
        }
        let args = [];
        let whereclause = "";
        let position = 1;
        // Add WHERE clause if present
        if (!isNull(struct.filterFields)) {
            // Verify the fields
            let isValid = isFilterFieldValid(struct.filterFields);
            if (isValid === false) {
                throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
            }
            // If fields are correct we add the where statements
            // Items that need where
            let keys = Object.keys(struct.filterFields);
            let values = Object.values(struct.filterFields);
            if (keys.length === 1) {
                let result = getWhereField(keys[0], position);
                whereclause = result.where;
                args = appendArguementsToArgs(keys[0], values[0], args);
                position = result.newPosition;
            }
            else {
                for (let i = 0; i < keys.length; i++) {
                    if (i == 0) {
                        let result = getWhereField(keys[0], position);
                        whereclause = result.where;
                        args = appendArguementsToArgs(keys[0], values[0], args);
                        position = result.newPosition;
                    }
                    else if (i == keys.length - 1) {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} ${result.where}`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                    else {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} AND ${result.where} AND`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                }
            }
        }
        if (!isNull(struct.filterFields)) {
            return { statement: `${selectStatement}${whereclause}`, args: args };
        }
        else {
            return { statement: selectStatement, args: args };
        }
    }
    catch (err) {
        console.log("Gotten error is", err);
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}
//# sourceMappingURL=generateReport.js.map