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
import Location from "../Tracking/location.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
import { MyErrors2 } from "../utility/constants.js";
/**
 * This function converts a raw asset register entry from database to assetregisterdata
 */
export function convertDatabaseResultToAssetRegisterEntry(rawData) {
    return new Promise((res, rej) => {
        // Get site, building and location of location in rawData
        Location.getSiteBuildingOffice(rawData.location_id).then(locationData => {
            console.log(locationData);
            let { location_id } = rawData, rawDataWithNoLocationID = __rest(rawData, ["location_id"]);
            let dataToReturn = Object.assign(Object.assign({}, rawDataWithNoLocationID), { site: locationData.site, building: locationData.building, office: locationData.office });
            return res(dataToReturn);
        }).catch((err) => {
            return rej(err);
        });
    });
}
/**
 * A function to get the data of the asset register report
 */
export function getAssetRegister() {
    return new Promise((res, rej) => {
        // Get data from database
        ReportDatabase.getAssetRegisterData().then(rawData => {
            // Add missing fields i.e site, building and office
            function getMissingFields(raw) {
                return new Promise((res, rej) => {
                    convertDatabaseResultToAssetRegisterEntry(raw).then(converted => {
                        return res(converted);
                    }).catch((err) => {
                        return res();
                    });
                });
            }
            let promises = [];
            rawData.forEach((elem) => {
                promises.push(getMissingFields(elem));
            });
            Promise.all(promises).then(data => {
                // Return updated
                let dataToReturn = data.filter((elem) => elem);
                return res(dataToReturn);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=asset_register.js.map