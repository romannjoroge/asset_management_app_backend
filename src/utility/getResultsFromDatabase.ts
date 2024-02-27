import pool from "../../db2.js";
import { MyErrors2 } from "./constants.js";
import { ResultFromDatabase } from "./helper_types.js";
import MyError from "./myError.js";

export default function getResultsFromDatabase<T>(query: string, args: any[]): Promise<T[]> {
    return new Promise((res, rej) => {
        pool.query(query, args).then((data: ResultFromDatabase<T>) => {
            return res(data.rows);
        }).catch((err: any) => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GET_FROM_DATABASE));
        })
    })
}