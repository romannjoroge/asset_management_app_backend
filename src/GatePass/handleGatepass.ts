import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js'

interface GatePassDetails {
    id: number;
    approved: boolean;
    date: string;
    fromlocation: string;
    tolocation: string;
    name: string;
    reason: string;
    deleted: boolean;
    comment: string;
}

interface GetGatePassDetailsFromDB {
    rowCount: number;
    rows: GatePassDetails[]
}

export function handleRequest(accept: boolean, comment: string, gatepassid: number): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if gatepass exists
        pool.query(gatePassTable.doesGatePassExist, [gatepassid]).then((data: GetGatePassDetailsFromDB) => {
            if (data.rowCount <= 0) {
                return rej(new MyError(Errors[31]));
            }

            // Handle request
            pool.query(gatePassTable.handleGatePass, [accept, comment, gatepassid]).then(_ => {
                return res();
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