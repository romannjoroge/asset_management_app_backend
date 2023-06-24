import Asset from "../Allocation/Asset/asset2.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js'
import Location from "../Tracking/location.js";

interface GatePassRequests {
    id: number;
    name: string;
    fromlocation: string;
    tolocation: string;
    date: string;
    barcode: string;
    reason: string;
    approved: boolean;
}

interface GetGatePassFromDB {
    rowCount: number;
    rows: GatePassRequests[]
}

export function getPastRequests(username: string): Promise<GatePassRequests[] | void> {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserExists(username).then(exists => {
            if (exists === false) {
                return rej(new MyError(Errors[30]));
            }

            // Get username
            User.getName(username).then(name => {
                // Get past requests
                pool.query(gatePassTable.getPreviousGatePasses, [name]).then((data: GetGatePassFromDB) => {
                    return res(data.rows);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}