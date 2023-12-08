import reportTable from './db_reports.js';
import { MyErrors2 } from '../utility/constants.js';
import MyError from '../utility/myError.js';
import pool from '../../db2.js';
import Location from '../Tracking/location.js';

interface TaggedAsset {
    id: number;
    barcode: string;
    description: string;
    category_name: string;
    serial_number: string;
    location: string;
    building?: string;
    office?: string
}
// A function that will get information of assets that are tagged
export function getTaggedAssets(is_tagged: boolean): Promise<TaggedAsset[]> {
    return new Promise((res, rej) => {
        // Function to get details from database
        getDetailsFromDatabase(is_tagged).then((rawAssetData: RawTaggedAsset[]) => {
            // Function to get location, building and office of asset
            let promises: Promise<TaggedAsset>[] = [];

            rawAssetData.map((r) => {
                promises.push(addOfficeBuildingLocationToAsset(r));
            })

            // Return
            Promise.all(promises).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_TAGGED_ASSETS));
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
function getDetailsFromDatabase(is_tagged: boolean): Promise<RawTaggedAsset[]> {
    return new Promise((res, rej) => {
        // Get details from database
        pool.query(reportTable.getRawAssetData, [is_tagged]).then((data: RawTaggedAssetFetchResult) => {
            return res(data.rows);
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_GET_ASSET_DATA))
        })
    });
}

export function addOfficeBuildingLocationToAsset(rawAsset: RawTaggedAsset): Promise<TaggedAsset> {
    return new Promise((res, rej) => {
        // Get id of building of location
        Location.findParentLocation(rawAsset.location_id).then((building_id: number | void) => {
            if (building_id) {
                // Get name of the building
                Location.getLocationName(building_id).then((building_name: string) => {
                    // Get id of site
                    Location.findParentLocation(building_id).then((site_id: number | void) => {
                        if (site_id) {
                            // Get name of the site
                            Location.getLocationName(site_id).then((site_name: string) => {
                                // Get name of location
                                Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                                    return res({
                                        id: rawAsset.id,
                                        barcode: rawAsset.barcode,
                                        description: rawAsset.description,
                                        category_name: rawAsset.category_name,
                                        serial_number: rawAsset.serial_number,
                                        location: site_name,
                                        building: building_name,
                                        office: location_name
                                    });
                                })
                            })
                        } else {
                            // Get name of site
                            Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                                return res({
                                    id: rawAsset.id,
                                    barcode: rawAsset.barcode,
                                    description: rawAsset.description,
                                    category_name: rawAsset.category_name,
                                    serial_number: rawAsset.serial_number,
                                    location: building_name,
                                    building: location_name,
                                    office: undefined
                                });
                            })
                        }
                    })
                })
            } else {
                // Get name of site
                Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                    return res({
                        id: rawAsset.id,
                        barcode: rawAsset.barcode,
                        description: rawAsset.description,
                        category_name: rawAsset.category_name,
                        serial_number: rawAsset.serial_number,
                        location: location_name,
                        building: undefined,
                        office: undefined
                    });
                })
            }
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_ADD_BUILDING_LOCATION));
        })
    });
}