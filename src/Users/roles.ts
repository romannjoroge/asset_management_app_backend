import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";

interface Role {
    name: string;
    id: number;
}

export default function getRolesFromDB(): Promise<Role[]> {
    return new Promise((res, rej) => {
        let query = "SELECT DISTINCT ON (name) name, id FROM Role ORDER BY name, id";
        getResultsFromDatabase<Role>(query, []).then(roles => {
            return res(roles);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_ROLES))
        })
    })
}