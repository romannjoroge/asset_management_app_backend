import { RawAssetRegisterData, AssetRegisterData, convertDatabaseResultToAssetRegisterEntry } from "./helpers.js";
import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
import { MyErrors2 } from "../utility/constants.js";





/**
 * A function to get the data of the asset register report
 */
export function getAssetRegister(): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data from database
        ReportDatabase.getAssetRegisterData().then(rawData => {
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

            
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}