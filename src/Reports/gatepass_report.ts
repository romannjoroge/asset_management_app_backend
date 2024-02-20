import Asset from "../Allocation/Asset/asset2.js";
import Location from "../Tracking/location.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { GatepassReport, RawGatepassReport } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function getGatepassReport(barcode: string): Promise<GatepassReport[]> {
    return new Promise((res, rej) => {
        // Convert barcode to assetid
        Asset._getAssetID(barcode).then(assetID => {
            // Get data from DB
            ReportDatabase.getGatepassReport(assetID).then(rawData => {
                // Convert raw gate pass to gate pass
                function convertRawGatePassToGatepass(rawElem: RawGatepassReport): Promise<GatepassReport | void> {
                    return new Promise((res, rej) => {
                        // Get from site, building and office
                        Location.getSiteBuildingOffice(rawElem.fromlocation).then(fromLocation => {
                            // Get to site, building and office
                            Location.getSiteBuildingOffice(rawElem.tolocation).then(toLocation => {
                                let {tolocation, fromlocation, ...rawDataWithNoLocation} = rawElem;
                                let convertedElem = {
                                    to_site: toLocation.site, 
                                    to_building: toLocation.building, 
                                    to_office: toLocation.office,
                                    from_site: fromLocation.site,
                                    from_building: fromLocation.building,
                                    from_office: fromLocation.office,
                                    ...rawDataWithNoLocation
                                }
                                return res(convertedElem);
                            }).catch((err: MyError) => {
                                // Do not throw error on failure instead return void
                                return res();
                            })
                        }).catch((err: MyError) => {
                            return res();
                        })
                    })
                }

                let promises: Promise<GatepassReport | void>[] = [];

                rawData.forEach((elem => {
                    promises.push(convertRawGatePassToGatepass(elem));
                }))

                Promise.all(promises).then(data => {
                    // Filter out blank entries in data
                    let dataToReturn: GatepassReport[] = data.filter((elem) => elem);

                    return res(dataToReturn);
                })
            }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    });
}