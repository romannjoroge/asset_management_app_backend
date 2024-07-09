var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { scheduleJob } from "node-schedule";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import { convertStoredReportToGenerateStruct } from "./convert-report-struct-to-generate.js";
import { generateSelectStatementFromGenerateReportStruct } from "./generateReport.js";
import pool from "../../db2.js";
import "dotenv/config";
import { loadDataToExcelFile } from "../Excel/createExcelFileForGeneralData.js";
import Mail from "../Mail/mail.js";
function createCronJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let reports = yield getResultsFromDatabase("SELECT name, period, report FROM GenerateReports WHERE deleted = false", []);
            for (let report of reports) {
                scheduleJob(report['name'], report['period'], () => __awaiter(this, void 0, void 0, function* () {
                    // @ts-ignore
                    let generateStruct = convertStoredReportToGenerateStruct(report.report);
                    let selectStatement = generateSelectStatementFromGenerateReportStruct(generateStruct);
                    console.log("Statement => ", selectStatement.statement);
                    let results = yield pool.query(selectStatement.statement, selectStatement.args);
                    let buffer = loadDataToExcelFile(results.rows, "Test");
                    // Send an email
                    console.log("Done");
                }));
            }
        }
        catch (err) {
            console.log(err, "Error In Cron Job");
        }
    });
}
// createCronJobs();
function test() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let struct = convertStoredReportToGenerateStruct({
                "name": "Zakayo Left Parliament",
                "creator": 1,
                "fields": [
                    {
                        "jsonName": "serialnumber",
                        "name": "Serial Number",
                        "description": "",
                    },
                    {
                        "jsonName": "acquisitiondate",
                        "name": "Acquisition Date",
                        "description": "Acquisition Date between 06-01-2024 and 07-03-2024",
                        "from": "06-01-2022",
                        "to": "07-03-2024"
                    },
                    {
                        "jsonName": "condition",
                        "name": "Condition",
                        "description": "Asset Condition To Be Installed",
                        "from": "Good"
                    },
                    {
                        "jsonName": "acquisitioncost",
                        "name": "Acquisition Cost",
                        "description": "Acquisition Cost between 100000 and 150000",
                        "from": 1,
                        "to": 150000
                    },
                    {
                        "jsonName": "residualvalue",
                        "name": "Residual Value",
                        "description": "Residual value between 10 and 100",
                        "from": 1,
                        "to": 100000
                    },
                    {
                        "jsonName": "category",
                        "name": "Category",
                        "description": "Furniture Category",
                        "from": 1
                    },
                    {
                        "jsonName": "usefullife",
                        "name": "Useful Life",
                        "description": "Useful life between 1 and 5",
                        "from": 1,
                        "to": 10
                    },
                    {
                        "jsonName": "barcode",
                        "name": "Barcode",
                        "description": ""
                    },
                    {
                        "jsonName": "description",
                        "name": "Description",
                        "description": ""
                    },
                    {
                        "jsonName": "location",
                        "name": "Location",
                        "description": "Kisian-Kisumu Location",
                        "from": 3
                    },
                    {
                        "jsonName": "disposaldate",
                        "name": "Disposal Date",
                        "description": "Disposal Date between 07-01-2024 and 07-24-2024",
                        "from": "07-01-2022",
                        "to": "07-24-2024"
                    },
                    {
                        "jsonName": "depreciationtype",
                        "name": "Depreciation Type",
                        "description": "double depreciation type",
                        "from": "written"
                    },
                    {
                        "jsonName": "responsible_user",
                        "name": "Responsible User",
                        "description": "Assets that belong to user Roman Njoroge",
                        "from": 1
                    },
                    {
                        "jsonName": "isconverted",
                        "name": "Is Converted",
                        "description": "Get Assets that are converted",
                        "from": false
                    },
                    {
                        "jsonName": "estimatedvalue",
                        "name": "Estimated Value",
                        "description": ""
                    }
                ],
                "frequency": {
                    "minutes": "*",
                    "hours": "*",
                    "dayMonth": "*",
                    "dayWeek": "*",
                    "month": "*"
                }
            });
            let selectStatement = generateSelectStatementFromGenerateReportStruct(struct);
            let results = yield pool.query(selectStatement.statement, (_a = selectStatement.args) !== null && _a !== void 0 ? _a : []);
            let buffer = loadDataToExcelFile(results.rows, "Test");
            Mail.sendMailWithAttachmentsToMultipleRecepients(`
              <h1>Test Mail</h1>
            `, "extremewireless@wireless.co.ke", ["roman.njoroge@njuguna.com"], "TEST EMAIL", buffer, "report.xlsx");
        }
        catch (err) {
            console.log("Error =>", err);
        }
    });
}
test();
//# sourceMappingURL=report-cron-jobs.js.map