import { FilterFields, ItemsThatDontNeedJoin, ItemsThatNeedJoin, SupportedGenerateAssetReportFields } from "./generated_report_types.js";
import _ from "lodash";
const { isNil } = _;
export function convertStoredReportToGenerateStruct(input) {
    try {
        let fieldsThatDontNeedJoin = [];
        let fieldsThatNeedJoin = [];
        let filterFields = {};
        // Fields that do not need join
        for (let i of input.fields) {
            // @ts-ignore
            if (ItemsThatDontNeedJoin.includes(i.jsonName)) {
                fieldsThatDontNeedJoin.push(i.jsonName);
            }
            // @ts-ignore
            if (ItemsThatNeedJoin.includes(i.jsonName)) {
                fieldsThatNeedJoin.push(i.jsonName);
            }
            // @ts-ignore
            if (Object.values(FilterFields).includes(i.jsonName)) {
                if (isNil(i === null || i === void 0 ? void 0 : i.to)) {
                    if (i.jsonName === SupportedGenerateAssetReportFields.DEPRECIATION_TYPE) {
                        if (i.from === "double") {
                            i.from = "Double Declining Balance";
                        }
                        else if (i.from === "straight") {
                            i.from = "Straight Line";
                        }
                        else if (i.from === "written") {
                            i.from = "Written Down Value";
                        }
                    }
                    filterFields[`${i.jsonName}`] = { from: i.from };
                }
                else {
                    // @ts-ignore
                    filterFields[`${i.jsonName}`] = { from: i.from, to: i.to };
                }
            }
        }
        return {
            fieldsThatDontNeedJoin: fieldsThatDontNeedJoin,
            fieldsThatNeedJoin: fieldsThatNeedJoin,
            filterFields: filterFields
        };
    }
    catch (err) {
        console.log(err, "Error");
        throw "Could Not Convert Stored Report";
    }
}
// console.log("Converted Stored Report is: ", convertStoredReportToGenerateStruct({
//     "name":"Zakayo Left Parliament",
//     "creator": 1,
//     "fields":[
//       {
//         "jsonName": "serialnumber",
//         "name":"Serial Number",
//         "description":"",
//       },
//       {
//         "jsonName":"acquisitiondate",
//         "name":"Acquisition Date",
//         "description":"Acquisition Date between 06-01-2024 and 07-03-2024",
//         "from":"06-01-2024",
//         "to":"07-03-2024"
//       },
//       {
//         "jsonName":"condition",
//         "name":"Condition",
//         "description":"Asset Condition To Be Installed",
//         "from":"To Be Installed"
//       },
//       {
//         "jsonName":"acquisitioncost",
//         "name":"Acquisition Cost",
//         "description":"Acquisition Cost between 100000 and 150000",
//         "from":100000,
//         "to":150000
//       },
//       {
//         "jsonName":"residualvalue",
//         "name":"Residual Value",
//         "description":"Residual value between 10 and 100",
//         "from":10,
//         "to":100
//       },
//       {
//         "jsonName":"category",
//         "name":"Category",
//         "description":"Furniture Category",
//         "from":3
//       },
//       {
//         "jsonName":"usefullife",
//         "name":"Useful Life",
//         "description":"Useful life between 1 and 5",
//         "from":1,
//         "to":5
//       },
//       {
//         "jsonName":"barcode",
//         "name":"Barcode",
//         "description":""
//       },
//       {
//         "jsonName":"description",
//         "name":"Description",
//         "description":""
//       },
//       {
//         "jsonName":"location",
//         "name":"Location",
//         "description":"Kisian-Kisumu Location",
//         "from":291
//       },
//       {
//         "jsonName":"disposaldate",
//         "name":"Disposal Date",
//         "description":"Disposal Date between 07-01-2024 and 07-24-2024",
//         "from": "07-01-2024",
//         "to": "07-24-2024"
//       },
//       {
//         "jsonName":"depreciationtype",
//         "name":"Depreciation Type",
//         "description":"double depreciation type",
//         "from":"double"
//       },
//       {
//         "jsonName":"responsible_user",
//         "name":"Responsible User",
//         "description":"Assets that belong to user Roman Njoroge",
//         "from":9
//       },
//       {
//         "jsonName":"isconverted",
//         "name":"Is Converted",
//         "description":"Get Assets that are converted",
//         "from":true
//       },
//       {
//         "jsonName":"estimatedvalue",
//         "name":"Estimated Value",
//         "description":""
//       }
//     ],
//     "frequency":{
//       "minutes":"*",
//       "hours": "*",
//       "dayMonth": "*",
//       "dayWeek":"*",
//       "month":"*"
//     }
//   }));
//# sourceMappingURL=convert-report-struct-to-generate.js.map