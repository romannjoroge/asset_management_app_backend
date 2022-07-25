const Pool = require('pg').Pool
const pool = new Pool({
    user: "asset_management",
    database: "asset_management",
    port: 5432,
    password: 'p2o5.h2so4'
})

// pool.query('SELECT * FROM assets.item', (error, result)=>{
//     console.log(result.rows)
// })

module.exports = pool