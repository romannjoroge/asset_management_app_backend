import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import utility from "../utility/utility.js";
import { FilterFields, SupportedGenerateAssetReportFields, WaysToFilterBy } from "./generated_report_types.js";
import _ from "lodash";
// import { StoreGenReportItem } from "./generateReport.js";
const { isNull } = _;
export function getSelectFromField(field) {
    try {
        if (field === SupportedGenerateAssetReportFields.LOCATION) {
            return "l.name AS location_name";
        }
        else if (field === SupportedGenerateAssetReportFields.CATEGORY) {
            return "c.name AS category";
        }
        else if (field === SupportedGenerateAssetReportFields.RESPONSIBLE_USER) {
            return "u.username AS responsible_user";
        }
        else if (field === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
            return "c.depreciationtype AS depreciationtype";
        }
        else {
            throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
        }
    }
    catch (err) {
        console.log("Get select from field", err);
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}
export function getWhereField(field, position) {
    if (field === FilterFields.ACQUISITION_COST) {
        return { where: `acquisitioncost BETWEEN $${position} AND $${position + 1}`, newPosition: position + 2 };
    }
    else if (field === FilterFields.ACQUISITION_DATE) {
        return { where: `acquisitiondate BETWEEN $${position} AND $${position + 1}`, newPosition: position + 2 };
    }
    else if (field === FilterFields.CATEGORY) {
        return { where: `c.id = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.CONDITION) {
        return { where: `condition = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.DEPRECIATION_TYPE) {
        return { where: `c.depreciationtype = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.DISPOSAL_DATE) {
        return { where: `disposaldate BETWEEN $${position} AND $${position + 1}`, newPosition: position + 2 };
    }
    else if (field === FilterFields.ISCONVERTED) {
        return { where: `isconverted = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.LOCATION) {
        return { where: `l.id = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.RESIDUAL_VALUE) {
        return { where: `residualvalue BETWEEN $${position} AND $${position + 1}`, newPosition: position + 2 };
    }
    else if (field === FilterFields.RESPONSIBLE_USER) {
        return { where: `u.id = $${position}`, newPosition: position + 1 };
    }
    else if (field === FilterFields.USEFUL_LIFE) {
        return { where: `usefullife BETWEEN $${position} AND $${position + 1}`, newPosition: position + 2 };
    }
    console.log("Get Where field", field, position);
    throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
}
// Assumes that field and value are both correct
export function appendArguementsToArgs(field, value, args) {
    if (field === FilterFields.ACQUISITION_COST) {
        args.push(value['from']);
        args.push(value['to']);
        return args;
    }
    else if (field === FilterFields.ACQUISITION_DATE) {
        args.push(value['from']);
        args.push(value['to']);
        return args;
    }
    else if (field === FilterFields.CATEGORY) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.CONDITION) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.DEPRECIATION_TYPE) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.DISPOSAL_DATE) {
        args.push(value['from']);
        args.push(value['to']);
        return args;
    }
    else if (field === FilterFields.ISCONVERTED) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.LOCATION) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.RESIDUAL_VALUE) {
        args.push(value['from']);
        args.push(value['to']);
        return args;
    }
    else if (field === FilterFields.RESPONSIBLE_USER) {
        args.push(value['from']);
        return args;
    }
    else if (field === FilterFields.USEFUL_LIFE) {
        args.push(value['from']);
        args.push(value['to']);
        return args;
    }
    throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
}
export function getSelectInnerJoinFromField(field) {
    try {
        if (field === SupportedGenerateAssetReportFields.LOCATION) {
            return "INNER JOIN Location l ON l.id = a.locationid";
        }
        else if (field === SupportedGenerateAssetReportFields.CATEGORY || field == SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
            return "INNER JOIN Category c ON c.id = a.categoryid";
        }
        else if (field === SupportedGenerateAssetReportFields.RESPONSIBLE_USER) {
            return "INNER JOIN User2 u ON u.id = a.responsibleuserid";
        }
        else {
            throw new MyError(MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED);
        }
    }
    catch (err) {
        console.log("Get select inner join error", err);
        throw new MyError(MyErrors2.NOT_GENERATE_SELECT_STATEMENT);
    }
}
// Match filter filed with its method to filter by
export function getWayToFilterField(field) {
    if (field === FilterFields.ACQUISITION_DATE ||
        field === FilterFields.DISPOSAL_DATE) {
        return WaysToFilterBy.DATE_RANGE;
    }
    else if (field === FilterFields.CONDITION ||
        field === FilterFields.DEPRECIATION_TYPE) {
        return WaysToFilterBy.STRING;
    }
    else if (field === FilterFields.ACQUISITION_COST ||
        field === FilterFields.RESIDUAL_VALUE ||
        field === FilterFields.USEFUL_LIFE) {
        return WaysToFilterBy.NUMBER_RANGE;
    }
    else if (field === FilterFields.CATEGORY ||
        field === FilterFields.LOCATION ||
        field === FilterFields.RESPONSIBLE_USER) {
        return WaysToFilterBy.ID;
    }
    else if (field === FilterFields.ISCONVERTED) {
        return WaysToFilterBy.BOOLEAN;
    }
    else {
        throw MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED;
    }
}
export function checkIfWayItemIsFilteredIsValid(value, wayToBeFiltered) {
    if (wayToBeFiltered === WaysToFilterBy.DATE_RANGE) {
        // Check if it has a to and from value
        if (!isNull(value['to']) && !isNull(value['from'])) {
            // Check if the values are dates or can be converted to dates
            try {
                value['to'] = utility.checkIfValidDate(value['to'], "Invalid Date");
                value['from'] = utility.checkIfValidDate(value['from'], "Invalid Date");
                return true;
            }
            catch (err) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else if (wayToBeFiltered === WaysToFilterBy.BOOLEAN) {
        return value['from'] === true || value['from'] === false;
    }
    else if (wayToBeFiltered === WaysToFilterBy.ID) {
        return Number.isInteger(value['from']) && value['from'] > 0;
    }
    else if (wayToBeFiltered === WaysToFilterBy.NUMBER_RANGE) {
        // Check if theres is a to and from value
        if (!isNull(value['to']) && !isNull(value['from'])) {
            // Check if to and from are numeric
            return Number.isInteger(value['to']) && Number.isInteger(value['from']);
        }
        else {
            return false;
        }
    }
    else if (wayToBeFiltered === WaysToFilterBy.STRING) {
        return typeof value['from'] === 'string';
    }
    return false;
}
export function isFilterFieldValid(filterFields) {
    // For each key
    let entries = Object.entries(filterFields);
    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let key = entry[0];
        let value = entry[1];
        // Check if key belongs to a valid filter field
        //@ts-ignore
        if (Object.values(FilterFields).includes(key) === false) {
            console.log(entry, "Invalid key is: ", key);
            return false;
        }
        // Check if value is the correct way its meant to be filtered
        let isCorrect = checkIfWayItemIsFilteredIsValid(value, getWayToFilterField(key));
        if (isCorrect === false) {
            console.log(entry, "Invalid value is: ", value);
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=generated_report_helpers.js.map