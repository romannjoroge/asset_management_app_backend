import { scheduleJob } from "node-schedule";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";

async function createCronJobs() {
    try {
        let reports = await getResultsFromDatabase<{name: string, period: string, report: Record<string, any>}>(
            "SELECT name, period, report FROM GenerateReports WHERE deleted = false",
            []
        );

        for (let report of reports) {
            scheduleJob(report['name'] ,report['period'], () => {
                console.log("Its happening", report['name'])
            });
        }
    } catch(err) {

    }
}

createCronJobs();