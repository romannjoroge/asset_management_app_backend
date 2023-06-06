var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Errors } from '../../utility/constants.js';
import MyError from '../../utility/myError.js';
import Asset from './asset2.js';
import assetTable from './db_assets.js';
export const createDeprecaitonSchedule = (assetID) => {
    return new Promise((res, rej) => {
        // Reject if asset does not exist
        Asset._doesAssetIDExist(assetID).then((doesExist) => {
            if (doesExist == false) {
                rej(new MyError(Errors[29]));
            }
            // Get assets lifespan, acqusitionDate, depreciationPercentage and acquisitionCost
            pool.query(assetTable.getDepreciationDetails, [assetID]).then((fetchResults) => {
                if (fetchResults.rowCount == 0) {
                    rej(new MyError(Errors[8]));
                }
                let { usefullife, acquisitiondate, acquisitioncost } = fetchResults.rows[0];
                let year = acquisitiondate.getFullYear();
                let openingbookvalue = acquisitioncost;
                let closingBookValue = 0;
                let accumulatedDepreciation = 0;
                // Create depreciation schedule entries
                for (let i = 0; i < usefullife; i++) {
                    let yearToAdd = year + i;
                    let openToAdd;
                    if (openingbookvalue !== acquisitioncost) {
                        openToAdd = closingBookValue;
                    }
                    else {
                        openToAdd = openingbookvalue;
                    }
                    let depreciationExpense = openToAdd * (depreciationPercentage / 100);
                }
            }).catch(err => {
                console.log(err);
                rej(new MyError(Errors[48]));
            });
        });
    });
};
function insertDepreciationSchedule(props) {
    return __awaiter(this, void 0, void 0, function* () {
        // Inserts data in props into the depreciation schedule table
        pool.query(assetTable.insertDepreciationSchedule, [props.year, props.assetID,
            props.openingBookValue, props.depreciationExpense, props.accumulatedDepreciation,
            props.closingBookValue]).catch(err => {
            console.log(err);
            throw new MyError(Errors[48]);
        });
    });
}
