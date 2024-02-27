import pool from "../../db2.js";
import { MyErrors2 } from "./constants.js";
import MyError from "./myError.js";
export default function getResultsFromDatabase(query, args) {
    return new Promise((res, rej) => {
        pool.query(query, args).then((data) => {
            return res(data.rows);
        }).catch((err) => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GET_FROM_DATABASE));
        });
    });
}
//# sourceMappingURL=getResultsFromDatabase.js.map