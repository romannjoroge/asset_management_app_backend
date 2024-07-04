import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface GeneratedReportFromDb {
    id: number,
    name: string,
    fields: {
        jsonName: string,
        name: string,
        description: string | undefined,
        from: any,
        to: any
    }[],
    frequency: {
        minutes: string,
        hours: string,
        dayMonth: string,
        dayWeek: string,
        month: string
    },
    creator: string
}


export async function getGeneratedReports(): Promise<{name: string, id: number}[]> {
    try {
        let query = "SELECT id, name FROM generatereports WHERE deleted = false";
        return await getResultsFromDatabase<{name: string, id: number}>(query, [])
    } catch(err) {
        throw new MyError(MyErrors2.NOT_GET_GENERATED_REPORTS);
    }
}