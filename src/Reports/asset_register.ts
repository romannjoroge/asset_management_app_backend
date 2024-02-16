import { RawAssetRegisterData } from "./database_helper.js";
import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";

interface AssetRegisterData {
    serial_number: string;
    acquisition_date: string;
    condition: string;
    responsible_users_name: string;
    acquisition_cost: number;
    residual_value: number;
    category_name: string;
    useful_life: number;
    barcode: string;
    description: string;
    site: string;
    building: string;
    office: string;
    expected_depreciation_date: string;
    days_to_disposal: number
}

/**
 * This function converts a raw asset register entry from database to assetregisterdata
 */
export function convertDatabaseResultToAssetRegisterEntry(rawData: RawAssetRegisterData): Promise<AssetRegisterData> {
    return new Promise((res, rej) => {
        // Get site, building and location of location in rawData
        Location.getSiteBuildingOffice(rawData.location_id).then(locationData => {
            console.log(locationData);
            let {location_id, ...rawDataWithNoLocationID} = rawData;
            let dataToReturn: AssetRegisterData = {...rawDataWithNoLocationID, site: locationData.site, building: locationData.building, office: locationData.office};
            return res(dataToReturn);
        }).catch((err: MyError) => {
            return rej(err)
        })
    })
}

/**
 * A function to get the data of the asset register report
 */
export function getAssetRegister(): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data from database
        ReportDatabase.g

        // Add missing fields i.e site, building and office

        // Return updated
    })
}