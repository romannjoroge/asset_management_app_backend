import { Errors } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import assetTable from "./db_assets.js";
import pool from '../../../db2.js';
import { assetStatusOptions } from "./asset2.js";

interface AssetDetails {
    assetID: number;
    barcode: string;
    description: string;
    condition: assetStatusOptions;
    category: string;
    serialnumber: string;
    location: string;
}

interface AssetDetailsFetchResult {
    rowCount: number;
    rows: AssetDetails[];
}

interface filterProp {
    locationID?: number;
    categoryID?: number;
}

export const filterAssetByDetails = (prop: filterProp): Promise<AssetDetails[] | never> => {
    let { locationID, categoryID } = prop;

    return new Promise((res, rej) => {
        if (locationID && categoryID) {
            // Return data for location and category
            pool.query(assetTable.filterAssetsByLocationAndCategory, [categoryID, locationID]).then((data: AssetDetailsFetchResult) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }
        // Return Nothing if location does not exist
        else if (locationID) {
            // Return data for location
            pool.query(assetTable.filterAssetsByLocation, [locationID]).then((data: AssetDetailsFetchResult) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }

        // Return Nothing if category does not exist
        else if (categoryID) {
            // Return data for category
            pool.query(assetTable.filterAssetsByCategory, [categoryID]).then((data: AssetDetailsFetchResult) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }
    });
}