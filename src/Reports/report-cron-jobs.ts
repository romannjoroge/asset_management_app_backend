import { scheduleJob } from "node-schedule";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import { convertStoredReportToGenerateStruct } from "./convert-report-struct-to-generate.js";
import { generateSelectStatementFromGenerateReportStruct } from "./generateReport.js";
import pool from "../../db2.js";
import "dotenv/config";

async function createCronJobs() {
    try {
        let reports = await getResultsFromDatabase<{name: string, period: string, report: Record<string, any>}>(
            "SELECT name, period, report FROM GenerateReports WHERE deleted = false",
            []
        );
        for await (let report of reports) {
            // @ts-ignore
            let generateStruct = convertStoredReportToGenerateStruct(report.report);
                
            let selectStatement = generateSelectStatementFromGenerateReportStruct(generateStruct);
            console.log("Statement => ", selectStatement.statement);
            let results = await pool.query(selectStatement.statement, selectStatement.args);
            for (let result of results) {
                console.log(result);
            }
            console.log("Done");
        }

        // for (let report of reports) {
        //     scheduleJob(report['name'] ,report['period'], async () => {
        //         // @ts-ignore
        //         let generateStruct = convertStoredReportToGenerateStruct(report.report);
                
        //         let selectStatement = generateSelectStatementFromGenerateReportStruct(generateStruct);
        //         console.log("Statement => ", selectStatement.statement);
        //         let results = await pool.query(selectStatement.statement, selectStatement.args);
        //         for (let result of results) {
        //             console.log(result);
        //         }
        //         console.log("Done");
        //     });
        // }
    } catch(err) {
        console.log(err, "Error In Cron Job")
    }
}

// createCronJobs();

async function test() {
    try {
        let struct = convertStoredReportToGenerateStruct({
            "name":"Zakayo Left Parliament",
            "creator": 1,
            "fields":[
              {
                "jsonName": "serialnumber",
                "name":"Serial Number",
                "description":"",
              },
            //   {
            //     "jsonName":"acquisitiondate",
            //     "name":"Acquisition Date",
            //     "description":"Acquisition Date between 06-01-2024 and 07-03-2024",
            //     "from":"06-01-2024",
            //     "to":"07-03-2024"
            //   },
            //   {
            //     "jsonName":"condition",
            //     "name":"Condition",
            //     "description":"Asset Condition To Be Installed",
            //     "from":"To Be Installed"
            //   },
              {
                "jsonName":"acquisitioncost",
                "name":"Acquisition Cost",
                "description":"Acquisition Cost between 100000 and 150000",
                "from":1,
                "to":150000
              },
            //   {
            //     "jsonName":"residualvalue",
            //     "name":"Residual Value",
            //     "description":"Residual value between 10 and 100",
            //     "from":1,
            //     "to":100000
            //   },
            //   {
            //     "jsonName":"category",
            //     "name":"Category",
            //     "description":"Furniture Category",
            //     "from":3
            //   },
              {
                "jsonName":"usefullife",
                "name":"Useful Life",
                "description":"Useful life between 1 and 5",
                "from":1,
                "to":100
              },
              {
                "jsonName":"barcode",
                "name":"Barcode",
                "description":""
              },
              {
                "jsonName":"description",
                "name":"Description",
                "description":""
              },
            //   {
            //     "jsonName":"location",
            //     "name":"Location",
            //     "description":"Kisian-Kisumu Location",
            //     "from":291
            //   },
            //   {
            //     "jsonName":"disposaldate",
            //     "name":"Disposal Date",
            //     "description":"Disposal Date between 07-01-2024 and 07-24-2024",
            //     "from": "07-01-2024",
            //     "to": "07-24-2024"
            //   },
              {
                "jsonName":"depreciationtype",
                "name":"Depreciation Type",
                "description":"double depreciation type",
                "from":"double"
              },
            //   {
            //     "jsonName":"responsible_user",
            //     "name":"Responsible User",
            //     "description":"Assets that belong to user Roman Njoroge",
            //     "from":9
            //   },
              {
                "jsonName":"isconverted",
                "name":"Is Converted",
                "description":"Get Assets that are converted",
                "from":true
              },
              {
                "jsonName":"estimatedvalue",
                "name":"Estimated Value",
                "description":""
              }
            ],
            "frequency":{
              "minutes":"*",
              "hours": "*",
              "dayMonth": "*",
              "dayWeek":"*",
              "month":"*"
            }
          });

          let selectStatement = generateSelectStatementFromGenerateReportStruct(struct);
          console.log("Statement =>", selectStatement.statement)
          let results = await pool.query(selectStatement.statement, selectStatement.args ?? []);
          console.log(results.rows);
    } catch(err) {
        console.log("Error =>", err)
    }
}
test();