// import {generateReport} from "../built/Reports/generateReport.js";
// import MyError from "../built/utility/myError.js";
// import { MyErrors2 } from "../built/utility/constants.js";
// import { assert } from "chai";

// describe("Generate Reports Test", function () {
//     const listWithInvalidOption = ['height', 'barcode'];


//     it("should throw error if invalid field is given", async () => {
//         try {
//             generateReport(listWithInvalidOption);
//         } catch(err) {
//             if (err instanceof MyError && err.message === MyErrors2.GENERATE_ASSET_REPORT_NOT_SUPPORTED) {
//                 assert(true)
//             } else {
//                 console.log(err);
//                 assert(false, "Wrong Error Thrown")
//             }
//         }
//     })
// })