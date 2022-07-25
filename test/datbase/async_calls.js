const pool = require('./connection_test')

const query = 'SELECT * FROM assets.item'

async function getAllItems(){
    try{
        const results = await pool.query(query)
        console.log(results.rows)
    }catch(error){
        console.log(error)
    }
}

getAllItems()