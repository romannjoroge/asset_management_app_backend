var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { SupportedGenerateAssetReportFields } from "./generated_report_types.js";
import { appendArguementsToArgs, getSelectFromField, getSelectInnerJoinFromField, getWhereField, isFilterFieldValid } from "./generated_report_helpers.js";
import _ from "lodash";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
const { isNull } = _;
export function storeGenerateReportStatement(struct) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // If items contains an item that is not in supported types return error
            for (let i of struct.fields) {
                //@ts-ignore
                if (Object.values(SupportedGenerateAssetReportFields).includes(i.jsonName) == false) {
                    throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
                }
            }
            // Check if user exists
            let doesUserExist = yield User.checkIfUserIDExists(struct.creator);
            if (!doesUserExist) {
                throw new MyError(MyErrors2.USER_NOT_EXIST);
            }
            // Create a mail subscription for the report
            let results = yield getResultsFromDatabase("INSERT INTO mailsubscriptions(name, description) VALUES ($1, $2) RETURNING id;", [struct.name, `${struct.name} custom report`]);
            let mailSubscriptionID = results[0].id;
            let cronJobstring = `${struct.frequency.minutes} ${struct.frequency.hours} ${struct.frequency.dayMonth} ${struct.frequency.month} ${struct.frequency.dayWeek}`;
            pool.query("INSERT INTO GenerateReports (name, period, creator_id, report, mailSubscriptionID) VALUES ($1, $2, $3, $4, $5)", [struct.name, cronJobstring, struct.creator, struct, mailSubscriptionID]);
        }
        catch (err) {
            if (err instanceof MyError) {
                throw err;
            }
            else {
                throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
            }
        }
    });
}
export function generateSelectStatementFromGenerateReportStruct(struct) {
    try {
        let estimatedvalue = false;
        // If struct is empty return empty string
        if (struct.fieldsThatDontNeedJoin.length === 0 && struct.fieldsThatNeedJoin.length === 0 && isNull(struct.filterFields)) {
            return { statement: "", isEstimatedValue: estimatedvalue };
        }
        // Items that don't need join segment
        let itemsThatDontNeedJoinSegment = "";
        if (struct.fieldsThatDontNeedJoin.length == 1) {
            if (struct.fieldsThatDontNeedJoin[0] !== SupportedGenerateAssetReportFields.ESTIMATEDVALUE) {
                itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment + `a.${struct.fieldsThatDontNeedJoin[0]}`;
            }
        }
        else if (struct.fieldsThatDontNeedJoin.length > 1) {
            for (let i = 0; i < struct.fieldsThatDontNeedJoin.length; i++) {
                if (struct.fieldsThatDontNeedJoin[i] === SupportedGenerateAssetReportFields.ESTIMATEDVALUE) {
                    estimatedvalue = true;
                    if (i == struct.fieldsThatDontNeedJoin.length - 1) {
                        itemsThatDontNeedJoinSegment = itemsThatDontNeedJoinSegment.slice(0, itemsThatDontNeedJoinSegment.length - 2);
                    }
                    continue;
                }
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
                dontAddInnerJoin = false;
            }
        }
        let selectStatement;
        if (struct.fieldsThatNeedJoin.length === 0) {
            selectStatement = `SELECT a.assetID, ${itemsThatDontNeedJoinSegment} FROM Asset a`;
        }
        else if (struct.fieldsThatDontNeedJoin.length === 0) {
            selectStatement = `SELECT a.assetID, ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`;
        }
        else {
            selectStatement = `SELECT a.assetID, ${itemsThatDontNeedJoinSegment}, ${itemsThatNeedJoinSegment} FROM Asset a ${innerJoinSegment}`;
        }
        let args = [];
        let whereclause = "";
        let position = 1;
        // Add WHERE clause if present
        if (!isNull(struct === null || struct === void 0 ? void 0 : struct.filterFields)) {
            // Verify the fields
            let isValid = isFilterFieldValid(struct.filterFields);
            if (isValid === false) {
                console.log("Invalid field: ", struct.filterFields);
                throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
            }
            // If fields are correct we add the where statements
            // Items that need where
            let keys = Object.keys(struct.filterFields);
            let values = Object.values(struct.filterFields);
            if (keys.length === 1) {
                let result = getWhereField(keys[0], position);
                whereclause = `WHERE ${result.where}`;
                args = appendArguementsToArgs(keys[0], values[0], args);
                position = result.newPosition;
            }
            else {
                for (let i = 0; i < keys.length; i++) {
                    if (i == 0) {
                        let result = getWhereField(keys[0], position);
                        whereclause = `WHERE ${result.where}`;
                        args = appendArguementsToArgs(keys[0], values[0], args);
                        position = result.newPosition;
                    }
                    else if (i == keys.length - 1 && keys.length === 2) {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} AND ${result.where}`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                    else if (i == keys.length - 1) {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} ${result.where}`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                    else if (i == 1) {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} AND ${result.where} AND`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                    else {
                        let result = getWhereField(keys[i], position);
                        whereclause = `${whereclause} ${result.where} AND`;
                        args = appendArguementsToArgs(keys[i], values[i], args);
                        position = result.newPosition;
                    }
                }
            }
        }
        if (!isNull(struct.filterFields)) {
            return { statement: `${selectStatement} ${whereclause}`, args: args, isEstimatedValue: estimatedvalue };
        }
        else {
            return { statement: selectStatement, args: args, isEstimatedValue: estimatedvalue };
        }
    }
    catch (err) {
        console.log("Gotten error is", err);
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}
//# sourceMappingURL=generateReport.js.map