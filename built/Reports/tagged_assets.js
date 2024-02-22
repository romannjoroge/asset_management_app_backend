import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function getTaggedAssets(isTagged) {
    return new Promise((res, rej) => {
        function getData() {
            return new Promise((res, rej) => {
                if (isTagged == true) {
                    ReportDatabase.getTaggedAssets(true).then(data => {
                        return res(data);
                    }).catch((err) => {
                        return rej(err);
                    });
                }
                else {
                    ReportDatabase.getTaggedAssets(false).then(data => {
                        return res(data);
                    }).catch((err) => {
                        return rej(err);
                    });
                }
            });
        }
        getData().then(rawData => {
            // Convert data to assetregisterdata
            batchAddSiteBuildingLocation(rawData).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=tagged_assets.js.map