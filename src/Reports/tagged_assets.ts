import reportTable from './db_reports.js';
import { MyErrors2 } from '../utility/constants.js';
import MyError from '../utility/myError.js';
import pool from '../../db2.js';

interface TaggedAsset {
    id: number;
    barcode: string;
    description: string;
    category_name: string;
    serial_number: string;
    location: string;
    building: string;
    office: string
}
// A function that will get information of assets that are tagged
function getTaggedAssets(): Promise<TaggedAsset[]> {
    return new Promise((res, rej) => {
        // Function to get details from database
        getDetailsFromDatabase().then((rawAssetData: RawTaggedAsset[]) => {
            // Function to get location, building and office of asset

            // Return
        }).catch((err: MyError) => {
            return rej(err);
        })
    });
}

interface RawTaggedAsset {
    id: number;
    barcode: string;
    description: string;
    category_name: string;
    serial_number: string;
    location_id: number
}

interface RawTaggedAssetFetchResult {
    rowCount: number;
    rows: RawTaggedAsset[]
}

// Returns details of assets from the database
function getDetailsFromDatabase(): Promise<RawTaggedAsset[]> {
    return new Promise((res, rej) => {
        // Get details from database
        pool.query(reportTable.getRawAssetData, []).then((data: RawTaggedAssetFetchResult) => {
            return res(data.rows);
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_GET_ASSET_DATA))
        })
    });
}