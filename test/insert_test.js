const pool = require('./connection_test')

const insertQuery = 'INSERT INTO assets.company (name, company_id) VALUES ($1, $2)'



pool.query(insertQuery, ['Test Company', 50], (error, result)=>{
    if (error) throw error
    console.log('Inserted data')
})