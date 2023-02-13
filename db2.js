// Creating a connection to the database
const dotenv = require('dotenv')
dotenv.config()
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.TESTDATABASEUSER,
    database: process.env.TESTDATABASE,
    port: process.env.PORT,
    password: process.env.PASSWORD
})

async function testDatabaseConnection(){
    try{
        const fetchResult = await pool.query('SELECT NOW()')
        console.log(fetchResult);
    }catch(err){
        console.log(err);
    }
}

testDatabaseConnection();

module.exports = pool