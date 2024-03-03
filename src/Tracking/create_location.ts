import pool from "../../db2.js"
import { MyErrors2 } from "../utility/constants.js"
import MyError from "../utility/myError.js"
import Location from "./location.js"

export default function createLocation(name: string, parentlocationid: number, companyName: string): Promise<void> {
    return new Promise((res, rej) => {
        // Check if location already exists
        Location.doesLocationExist(name, parentlocationid).then(doesExist => {
            if (doesExist == true) {
                return rej(new MyError(MyErrors2.EXISTS_LOCATION));
            }
            
            if (parentlocationid === -1) {
                let query ="INSERT INTO Location (name, companyname) VALUES ($1, $2)";
                
                pool.query(query, [name, companyName]).then((_: any) => {
                    return res();
                }).catch((err: any) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                })
            } else {

                // Create location
                let query = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, $3)";

                pool.query(query, [name, companyName, parentlocationid]).then((_: any) => {
                    return res();
                }).catch((err: any) => {
                    return rej(new MyError(MyErrors2.NOT_CREATE_LOCATION));
                })
            }
        })
    })
}