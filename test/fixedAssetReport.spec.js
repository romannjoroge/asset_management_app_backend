import { assert } from "chai";
import pool from "../db2.js";
import Reconciliation from "../src/Reconciliation/reconciliation.js";

describe('fixed Asset Report tests', function() {
    this.beforeEach(async function() {
        try{
            await pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
            await pool.query('INSERT INTO Asset VALUES')
        }
    })
});