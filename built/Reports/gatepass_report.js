var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import Asset from "../Allocation/Asset/asset2.js";
import Location from "../Tracking/location.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
export function getGatepassReport(barcode) {
    return new Promise((res, rej) => {
        // Convert barcode to assetid
        Asset._getAssetID(barcode).then(assetID => {
            // Get data from DB
            ReportDatabase.getGatepassReport(assetID).then(rawData => {
                // Convert raw gate pass to gate pass
                function convertRawGatePassToGatepass(rawElem) {
                    return new Promise((res, rej) => {
                        // Get from site, building and office
                        Location.getSiteBuildingOffice(rawElem.fromlocation).then(fromLocation => {
                            // Get to site, building and office
                            Location.getSiteBuildingOffice(rawElem.tolocation).then(toLocation => {
                                let { tolocation, fromlocation } = rawElem, rawDataWithNoLocation = __rest(rawElem, ["tolocation", "fromlocation"]);
                                let convertedElem = Object.assign({ to_site: toLocation.site, to_building: toLocation.building, to_office: toLocation.office, from_site: fromLocation.site, from_building: fromLocation.building, from_office: fromLocation.office }, rawDataWithNoLocation);
                                return res(convertedElem);
                            }).catch((err) => {
                                // Do not throw error on failure instead return void
                                return res();
                            });
                        }).catch((err) => {
                            return res();
                        });
                    });
                }
                let promises = [];
                rawData.forEach((elem => {
                    promises.push(convertRawGatePassToGatepass(elem));
                }));
                Promise.all(promises).then(data => {
                    // Filter out blank entries in data
                    let dataToReturn = data.filter((elem) => elem);
                    return res(dataToReturn);
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=gatepass_report.js.map