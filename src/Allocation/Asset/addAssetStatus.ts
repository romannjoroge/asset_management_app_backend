import pool from "../../../db2.js";
import { MyErrors2 } from "../../utility/constants.js";
import getResultsFromDatabase from "../../utility/getResultsFromDatabase.js";
import MyError from "../../utility/myError.js";


export default function createAssetStatus(name: string, description: string): Promise<void> {
    return new Promise((res, rej) => {
        // Check if asset already exists
        checkIfAssetStatusExists(name).then(statusExists => {
            if (statusExists == true) {
                return rej(new MyError(MyErrors2.EVENT_ALREADY_EXISTS));
            }

            // Create event
            let query = "INSERT INTO AssetStatus(name, description) VALUES ($1, $2)";
            pool.query(query, [name, description]).then((_: void) => {
                return res();
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_ADD_EVENT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_ADD_EVENT));
        })
    });
}

export function checkIfAssetStatusExists(name: string): Promise<boolean> {
    return new Promise((res, rej) => {
        let query = "SELECT name FROM AssetStatus WHERE name = $1";

        getResultsFromDatabase<{name: string}>(query, [name]).then(results => {
            if (results.length > 0) {
                return res(true);
            } else {
                return res(false);
            }
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_CHECK_IF_EVENT_EXISTS));
        })
    })
}
