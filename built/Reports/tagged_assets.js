import reportTable from './db_reports.js';
import { MyErrors2 } from '../utility/constants.js';
import MyError from '../utility/myError.js';
import pool from '../../db2.js';
// A function that will get information of assets that are tagged
function getTaggedAssets() {
    return new Promise((res, rej) => {
        // Function to get details from database
        getDetailsFromDatabase().then((rawAssetData) => {
            // Function to get location, building and office of asset
            // Return
        }).catch((err) => {
            return rej(err);
        });
    });
}
// Returns details of assets from the database
function getDetailsFromDatabase() {
    return new Promise((res, rej) => {
        // Get details from database
        pool.query(reportTable.getRawAssetData, []).then((data) => {
            return res(data.rows);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_ASSET_DATA));
        });
    });
}
//# sourceMappingURL=tagged_assets.js.map