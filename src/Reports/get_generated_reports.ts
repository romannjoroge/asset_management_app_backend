import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

export function getGeneratedReports(): Promise<{name: string, id: number}[]> {
    return new Promise((res, rej) => {
        let query = "SELECT id, name FROM generatereports WHERE deleted = false";
        getResultsFromDatabase<{name: string, id: number}>(query, []).then(results => {
            return res(results);
        }).catch((_err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_GENERATED_REPORTS));
        })
    })
}