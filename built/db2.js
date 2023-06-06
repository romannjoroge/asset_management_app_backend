var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing exec to run functions on command line
import { spawn } from 'child_process';
// Creating a connection to the database
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { stderr } from 'process';
const { Pool } = pg;
let pool;
function testDatabaseConnection(pool) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fetchResult = yield pool.query('SELECT NOW()');
            console.log(fetchResult);
        }
        catch (err) {
            console.log(err);
        }
    });
}
// Changing database connection based on node environment
const env = process.env.NODE_ENV || "development";
if (env.match('test')) {
    pool = new Pool({
        user: process.env.TESTDATABASEUSER,
        database: process.env.TESTDATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    });
}
else if (env.match('windows')) {
    pool = new Pool({
        user: 'postgres',
        database: 'postgres',
        port: process.env.PORT,
        password: 'postgres'
    });
}
else {
    pool = new Pool({
        user: process.env.DATABASEUSER,
        database: process.env.DATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    });
}
export default pool;
