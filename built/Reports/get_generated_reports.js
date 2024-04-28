import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export function getGeneratedReports() {
    return new Promise((res, rej) => {
        let query = "SELECT id, name FROM generatereports WHERE deleted = false";
        getResultsFromDatabase(query, []).then(results => {
            return res(results);
        }).catch((_err) => {
            return rej(new MyError(MyErrors2.NOT_GET_GENERATED_REPORTS));
        });
    });
}
//# sourceMappingURL=get_generated_reports.js.map