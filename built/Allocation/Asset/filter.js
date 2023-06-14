import { Errors } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import assetTable from "./db_assets.js";
import pool from '../../../db2.js';
export const filterAssetByDetails = (prop) => {
    let { locationID, categoryID } = prop;
    return new Promise((res, rej) => {
        if (locationID && categoryID) {
            // Return data for location and category
            pool.query(assetTable.filterAssetsByLocationAndCategory, [categoryID, locationID]).then((data) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }
        // Return Nothing if location does not exist
        else if (locationID) {
            // Return data for location
            pool.query(assetTable.filterAssetsByLocation, [locationID]).then((data) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }
        // Return Nothing if category does not exist
        else if (categoryID) {
            console.log(categoryID);
            // Return data for category
            pool.query(assetTable.filterAssetsByCategory, [categoryID]).then((data) => {
                console.log(data.rows);
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }
    });
};
//# sourceMappingURL=filter.js.map