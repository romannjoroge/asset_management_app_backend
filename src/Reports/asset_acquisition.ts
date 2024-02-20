import { AssetRegisterData, RawAssetRegisterData, batchAddSiteBuildingLocation } from "./helpers.js";
import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
import ReportDatabase from "./reportDatabase.js";

/**
 * 
 * @param startDate The beginning of purchase period
 * @param endDate The ending of purchase period
 * @param locationid The location to look into
 * @returns The details of assets purchased in purchasing period in the specified location and its child locations
 */
export function assetAcquisition(startDate: Date, endDate: Date, locationid: number): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        let childLocations: number[] = [locationid];
        // Find all locations I need to get assets of
        Location.findChildLocations(locationid, childLocations).then(locationsToLookInto => {
            
            // Function to get asset data for a location
            function getAssetDataLocation(startDate: Date, endDate: Date, locationid: number): Promise<AssetRegisterData[] | void> {
                return new Promise((res, rej) => {
                    ReportDatabase.getAcquiredAssetsInLocation(startDate, endDate, locationid).then(rawData => {
                        // Convert data
                        batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                            return res(converted);
                        }).catch((err: MyError) => {
                            return res()
                        })
                    }).catch((err: MyError) => {
                        return res()
                    })
                })
            }

            // Get asset data for each location
            let promises: Promise<AssetRegisterData[] | void>[] = [];

            locationsToLookInto.forEach((location) => {
                promises.push(getAssetDataLocation(startDate, endDate, locationid))
            });

            let dataToReturn: AssetRegisterData[] = [];
            Promise.all(promises).then(data => {
                data.forEach((elem) => {
                    if(elem) {
                        dataToReturn.push(...elem);
                    }
                });

                return res(dataToReturn);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT))
        })
    })
}