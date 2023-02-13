// Creating a connection to the database
const dotenv = require('dotenv')
dotenv.config()
const Pool = require('pg').Pool
let pool;

async function testDatabaseConnection(){
    try{
        const fetchResult = await pool.query('SELECT NOW()')
        console.log(fetchResult);
    }catch(err){
        console.log(err);
    }
}

// testDatabaseConnection();

// Changing database connection based on node environment
const env = process.env.NODE_ENV || "development";
if (env === "test"){
    pool = new Pool({
        user: process.env.TESTDATABASEUSER,
        database: process.env.TESTDATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    })
}else{
    pool = new Pool({
        user: process.env.DATABASEUSER,
        database: process.env.DATABASE,
        port: process.env.PORT,
        password: process.env.PASSWORD
    })
}

module.exports = pool