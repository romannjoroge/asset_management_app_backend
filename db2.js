// Creating a connection to the database
import "dotenv/config";

import pg from 'pg';
const { Pool } = pg;
let pool;

async function testDatabaseConnection(pool){
    try{
        const fetchResult = await pool.query('SELECT NOW()')
        console.log(fetchResult);
    }catch(err){
        console.log(err);
    }
}

// Changing database connection based on node environment
const env = process.env.NODE_ENV || "development";
if (env.match('test')){
    pool = new Pool({
        user: process.env.TESTDATABASEUSER,
        database: process.env.TESTDATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    })
} else if (env.match('windows')){
    pool = new Pool({
        user: 'postgres',
        database: 'postgres',
        port: process.env.PORT,
        password: 'postgres'
    })
}else{
    console.log("THERE")
    pool = new Pool({
        user: process.env.DATABASEUSER,
        database: process.env.DATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    })
}

export default pool;