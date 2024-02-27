import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function getAssetsPresentInInventory(inventoryID) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetsInInventory(inventoryID).then(rawResults => {
            // Batch convert
            batchAddSiteBuildingLocation(rawResults).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        });
    });
}
export function getAssetsMissingInInventory(inventoryID) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetsMissingInInventory(inventoryID).then(rawResults => {
            // Batch convert
            batchAddSiteBuildingLocation(rawResults).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        });
    });
}
export function getAdditionalAssetsInInventory(inventoryID) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAdditionalAssetsInInventory(inventoryID).then(rawResults => {
            // Batch convert
            batchAddSiteBuildingLocation(rawResults).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        });
    });
}
//# sourceMappingURL=inventory.js.map