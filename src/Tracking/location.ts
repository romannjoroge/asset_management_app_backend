// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import MyError from '../utility/myError.js';
import locationTable from './db_location.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
import reportsTable from '../Reports/db_reports.js';

interface selectLocation {
    id: number;
    name: string;
    companyname: string;
    parentlocationid: number;
    deleted: boolean;
}

interface GetParentLocationFetchResult {
    rowCount: number;
    rows: {parentlocationid: number}[]
}

interface GetLocationNameFetchResult {
    rowCount: number;
    rows: {name: string}[]
}

export interface selectLocationResults {
    rows: selectLocation[];
    rowCount: number;
}

interface SiteBuildingOffice {
    site: string;
    building: string;
    office: string;
}


class Location {
    constructor (){}

    static async verifyLocationID(id: number): Promise<boolean>{
        // Returns true if locationID exists in the database, false otherwise
        let fetchResult;
        try{
            fetchResult = await pool.query(locationTable.getLocation, [id]);
        }catch(err){
            throw new MyError(Errors[3]);
        }
        return (fetchResult.rowCount > 0);
    }

    static async doesLocationNameExist(name: string): Promise<boolean | never> {
        return new Promise((res, rej) => {
            pool.query(locationTable.doesLocationExist, [name]).then((result: selectLocationResults) => {
                return res(result.rowCount > 0);
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        });
    }

    // Find all child locations
    static findChildLocations(id: number, locationIDs: number[]): Promise<number[] | never> {
        return new Promise((res, rej) => {
            // Get the child locations of the location with id ID
            pool.query(reportsTable.getChildLocations, [id]).then(data => {
                if (data.rowCount > 0) {
                    // Add each location to locationIDs and call findChildLocations on each location
                    for (let i in data.rows) {
                        locationIDs.push(data.rows[i]['id']);

                        // Resolve so that recursive call can end
                        res(Location.findChildLocations(data.rows[i]['id'], locationIDs));
                    }
                }
                // Base Case, function should do nothing if location has no children 
                else {
                    res(locationIDs);
                }
            }).catch(err => {
                console.log(err);
                rej(Errors[9]);
            })
        });
    }

    // A function that finds the immediate parent of a location. If the location has no parent null is returned
    static findParentLocation(id: number): Promise<number | void> {
        return new Promise((res, rej) => {
            pool.query(locationTable.getParentLocations, [id]).then((data: GetParentLocationFetchResult) => {
                if (data.rowCount <= 0) {
                    return res();
                } else {
                    return res(data.rows[0].parentlocationid);
                }
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GET_PARENT_LOCATION))
            });
        });
    }

    // Finds the ID of the site of the location of the given id
    static async findIDOfSiteOfLocation(id: number): Promise<number> {
        try {
            let parentLocationID: number | void = 1;
            let locationID = id;

            while (!parentLocationID) {
                // Get parent location
                parentLocationID = await this.findParentLocation(locationID);
                
                if (parentLocationID) {
                    locationID = parentLocationID
                }
            }

            return locationID;
        } catch(err) {
            throw new MyError(MyErrors2.NOT_GET_PARENT_LOCATION);
        }
    }

    // A function to get the name of a location from an id
    static getLocationName(id: number): Promise<string> {
        return new Promise((res, rej) => {
            // Get name from database
            pool.query(locationTable.getLocationName, [id]).then((data: GetLocationNameFetchResult) => {
                if (data.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_GET_LOCATION_NAME));
                } else {
                    return res(data.rows[0].name);
                }
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GET_LOCATION_NAME))
            })
        });
    }

    // Find the site, building and office of a location from its ID
    static getSiteBuildingOffice(locationid: number): Promise<SiteBuildingOffice> {
        return new Promise((res, rej) => {
            // Throw error if location does not exist
            this.verifyLocationID(locationid).then(doesExist => {
                if (doesExist === false) {
                    return rej(new MyError(MyErrors2.LOCATION_NOT_EXIST))
                }
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE))
            })
        });
    }

    // Find parent locations
    static findParentLocations(id: number, locationIDs: number[]): Promise<number[] | never> {
        return new Promise((res, rej) => {
            // Get the parent locations of the locations with id ID
            pool.query(locationTable.getParentLocations, [id]).then(data => {
                if (data.rowCount > 0) {
                    // Add each location to locationIDs and call findChildLocations on each location
                    for (let i in data.rows) {
                        locationIDs.push(data.rows[i]['parentlocationid']);

                        // Resolve so that recursive call can end
                        res(Location.findParentLocations(data.rows[i]['parentlocationid'], locationIDs));
                    }
                }
                // Base Case, function should do nothing if location has no children 
                else {
                    res(locationIDs);
                }
            }).catch(err => {
                console.log(err);
                rej(Errors[9]);
            });
        });
    }
}

export default Location;