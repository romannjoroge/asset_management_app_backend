var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Category from "../Category/category2.js";
import Location from "../../Tracking/location.js";
import utility from "../../utility/utility.js";
import { checkIfAssetStatusExists } from "./addAssetStatus.js";
export default function generateBarcode(categoryid, locationid, assetid, assetStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            // Check if category ID exists
            Category._doesCategoryIDExist(categoryid).then(categExist => {
                if (categExist === false) {
                    return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
                }
                // Check if location exists
                Location.verifyLocationID(locationid).then(locationExists => {
                    if (locationExists === false) {
                        return rej(new MyError(MyErrors2.LOCATION_NOT_EXIST));
                    }
                    console.log(assetStatus);
                    // Check if status exists
                    checkIfAssetStatusExists(assetStatus).then(isAssetStatusValid => {
                        if (isAssetStatusValid === false) {
                            return rej(new MyError(MyErrors2.ASSET_STATUS_NOT_EXIST));
                        }
                        console.log("Asset Status Exists");
                        // Get site of location
                        Location.findIDOfSiteOfLocation(locationid).then(siteID => {
                            // Combine values
                            const paddedCategoryID = utility.padStringWithCharacter(categoryid.toString(), '0', 2);
                            const paddedSiteID = utility.padStringWithCharacter(siteID.toString(), '0', 2);
                            const paddedAssetID = utility.padStringWithCharacter(assetid.toString(), '0', 7);
                            const barcode = paddedCategoryID + paddedSiteID[0] + paddedSiteID[1] + paddedAssetID + '0';
                            console.log(`Barcode ${barcode}`);
                            if (barcode.length > 12) {
                                throw new MyError(MyErrors2.INVALID_BARCODE);
                            }
                            return res(barcode);
                        }).catch((err) => {
                            return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
                        });
                    }).catch((err) => {
                        return rej(new MyError(MyErrors2.ASSET_STATUS_NOT_EXIST));
                    });
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
            });
        });
    });
}
//# sourceMappingURL=generateBarcode.js.map