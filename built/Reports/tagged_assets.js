import reportTable from './db_reports.js';
import { MyErrors2 } from '../utility/constants.js';
import MyError from '../utility/myError.js';
import pool from '../../db2.js';
import Location from '../Tracking/location.js';
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
function addOfficeBuildingLocationToAsset(rawAsset) {
    return new Promise((res, rej) => {
        // Get id of building of location
        Location.findParentLocation(rawAsset.location_id).then((building_id) => {
            // Get name of the building
            Location.getLocationName(building_id).then((building_name) => {
                // Get id of site
                Location.findParentLocation(building_id).then((site_id) => {
                    // Get name of the site
                    Location.getLocationName(site_id).then((site_name) => {
                        // Get name of location
                        Location.getLocationName(rawAsset.location_id).then((location_name) => {
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
                        }).catch((err) => {
                            return rej(err);
                        });
                    }).catch((err) => {
                        return rej(err);
                    });
                }).catch((err) => {
                    return rej(err);
                });
            }).catch((err) => {
                return rej(err);
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_BUILDING_LOCATION));
        });
    });
}
//# sourceMappingURL=tagged_assets.js.map