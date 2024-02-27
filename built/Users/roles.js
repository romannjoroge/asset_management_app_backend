import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export default function getRolesFromDB() {
    return new Promise((res, rej) => {
        let query = "SELECT DISTINCT ON (name) name, id FROM Role ORDER BY name, id";
        getResultsFromDatabase(query, []).then(roles => {
            return res(roles);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_ROLES));
        });
    });
}
//# sourceMappingURL=roles.js.map