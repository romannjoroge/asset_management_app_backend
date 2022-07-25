const pool = require('./connection_test')

const query1 = 'SELECT * FROM assets.item'

pool.query(query1, (error, result)=>{
    if (error) throw error
    console.log(result.rows)
})