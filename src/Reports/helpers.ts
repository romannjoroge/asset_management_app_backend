import Location, { SiteBuildingOffice } from "../Tracking/location.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export interface AssetRegisterData extends SiteBuildingOffice{
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
    expected_depreciation_date: string;
    days_to_disposal: number
}

export interface RawAssetRegisterData extends HasLocationID{
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
    expected_depreciation_date: string;
    days_to_disposal: number
}

export interface ChainOfCustody {
    username: string;
    name_of_user: string;
    time_allocated: string;
    event_description: string;
    asset_description: string;
}

export interface AssetMovement extends SiteBuildingOffice{
    time_moved: string;
    barcode: string;
    asset_description: string;
}

interface HasLocationID {
    locationid: number;
}

export interface RawAssetMovement extends HasLocationID {
    time_moved: string;
    asset_description: string;
    barcode: string;
}

export interface GatepassReport {
    barcode: string;
    asset_description: string;
    gatepass_reason: string;
    from_site: string;
    from_building: string;
    from_office: string;
    to_site: string;
    to_building: string;
    to_office: string;
    leaving_time: string;
    assigned_user_username: string;
    assigned_user_name: string;
    is_gatepass_approved: boolean;
    gatepass_comment: string;
}

export interface RawGatepassReport {
    barcode: string;
    asset_description: string;
    gatepass_reason: string;
    fromlocation: number;
    tolocation: number;
    leaving_time: string;
    assigned_user_username: string;
    assigned_user_name: string;
    is_gatepass_approved: boolean;
    gatepass_comment: string;
}
/**
 * 
 * @param rawData A list of type T that has locationid and wants to add details of site, building, office
 * @returns converted list of type that has site building office
 */
export function batchAddSiteBuildingLocation<T extends HasLocationID, S extends SiteBuildingOffice>(rawData: T[]): Promise<S[]> {
    return new Promise((res, rej) => {
        // Add missing fields i.e site, building and office
        function getMissingFields(raw: T): Promise<S | void> {
            return new Promise((res, rej) => {
                convertHasLocationToSiteBuilding<T, S>(raw).then(converted => {
                    return res(converted);
                }).catch((err: MyError) => {
                    return res();
                })
            })
        }

        let promises: Promise<S | void>[] = [];
        rawData.forEach((elem) => {
            promises.push(getMissingFields(elem))
        })

        Promise.all(promises).then(data => {
            // Return updated
            let dataToReturn: S[] = data.filter((elem) => elem);
            return res(dataToReturn);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}

/**
 * This function converts an element that has locationid to one that has site, building, office
 */
export function convertHasLocationToSiteBuilding<T extends HasLocationID, S extends SiteBuildingOffice>(rawData: T): Promise<S> {
    return new Promise((res, rej) => {
        // Get site, building and location of location in rawData
        Location.getSiteBuildingOffice(rawData.locationid).then(locationData => {
            let {locationid, ...rawDataWithNoLocationID} = rawData;
            let dataToReturn: S = {...rawDataWithNoLocationID, site: locationData.site, building: locationData.building, office: locationData.office};
            return res(dataToReturn);
        }).catch((err: MyError) => {
            return rej(err)
        })
    })
}