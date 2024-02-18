import Location from "../Tracking/location.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export interface AssetRegisterData {
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

export interface RawAssetRegisterData {
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
    location_id: number;
    expected_depreciation_date: string;
    days_to_disposal: number
}

/**
 * 
 * @param rawData A list of RawAssetRegister data to convert
 * @returns converted list of AssetRegisterData
 */
export function batchConvertRawAssetRegister(rawData: RawAssetRegisterData[]): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Add missing fields i.e site, building and office
        function getMissingFields(raw: RawAssetRegisterData): Promise<AssetRegisterData | void> {
            return new Promise((res, rej) => {
                convertDatabaseResultToAssetRegisterEntry(raw).then(converted => {
                    return res(converted);
                }).catch((err: MyError) => {
                    return res();
                })
            })
        }

        let promises: Promise<AssetRegisterData | void>[] = [];
        rawData.forEach((elem) => {
            promises.push(getMissingFields(elem))
        })

        Promise.all(promises).then(data => {
            // Return updated
            let dataToReturn: AssetRegisterData[] = data.filter((elem) => elem);
            return res(dataToReturn);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
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
