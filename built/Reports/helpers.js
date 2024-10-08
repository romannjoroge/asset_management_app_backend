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
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
/**
 *
 * @param rawData A list of type T that has locationid and wants to add details of site, building, office
 * @returns converted list of type that has site building office
 */
export function batchAddSiteBuildingLocation(rawData) {
    return new Promise((res, rej) => {
        // Add missing fields i.e site, building and office
        function getMissingFields(raw) {
            return new Promise((res, rej) => {
                convertHasLocationToSiteBuilding(raw).then(converted => {
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
    });
}
/**
 * This function converts an element that has locationid to one that has site, building, office
 */
export function convertHasLocationToSiteBuilding(rawData) {
    return new Promise((res, rej) => {
        // Get site, building and location of location in rawData
        Location.getSiteBuildingOffice(rawData.locationid).then(locationData => {
            let { locationid } = rawData, rawDataWithNoLocationID = __rest(rawData, ["locationid"]);
            let dataToReturn = Object.assign(Object.assign({}, rawDataWithNoLocationID), { site: locationData.site, building: locationData.building, office: locationData.office });
            return res(dataToReturn);
        }).catch((err) => {
            return rej(err);
        });
    });
}
//# sourceMappingURL=helpers.js.map