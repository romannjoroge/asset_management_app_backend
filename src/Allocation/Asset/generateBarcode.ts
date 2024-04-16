import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Category from "../Category/category2.js";
import Location from "../../Tracking/location.js";
import Asset from "./asset2.js";
import utility from "../../utility/utility.js";
import {checkIfAssetStatusExists} from "./addAssetStatus.js";

export default async function generateBarcode(categoryid: number, locationid: number, assetid: number, assetStatus: string): Promise<string> {
    return new Promise((res, rej) => {
        // Check if category ID exists
        Category._doesCategoryIDExist(categoryid).then(categExist => {
            if(categExist === false) {
                return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
            }

            // Check if location exists
            Location.verifyLocationID(locationid).then(locationExists => {
                if(locationExists === false) {
                    return rej(new MyError(MyErrors2.LOCATION_NOT_EXIST));
                }
                console.log(assetStatus)

                // Check if status exists
                checkIfAssetStatusExists(assetStatus).then(isAssetStatusValid => {
                  if (isAssetStatusValid === false) {
                    return rej(new MyError(MyErrors2.ASSET_STATUS_NOT_EXIST));
                  }
                  console.log("Asset Status Exists")

                  // Get site of location
                  Location.findIDOfSiteOfLocation(locationid).then(siteID => {
                    // Combine values
                    const paddedCategoryID = utility.padStringWithCharacter(categoryid.toString(), '0', 2);
                    const paddedSiteID = utility.padStringWithCharacter(siteID.toString(), '0', 2);
                    const paddedAssetID = utility.padStringWithCharacter(assetid.toString(), '0', 7);
                    const statusCode = Math.floor(Math.random() * 10).toString();
                    console.log(statusCode)

                    const barcode = paddedCategoryID + paddedSiteID + paddedAssetID + statusCode;
                    console.log(`Barcode ${barcode}`);

                    if (barcode.length > 12) {
                      throw new MyError(MyErrors2.INVALID_BARCODE);
                    }

                    return res(barcode);
                  }).catch((err: MyError) => {
                    return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
                  })
                }).catch((err) => {
                  return rej(new MyError(MyErrors2.ASSET_STATUS_NOT_EXIST));
                })
                
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
            })

        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
        })
    })
}
