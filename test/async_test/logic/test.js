const pool = require('../../datbase/connection_test')

const query = 'SELECT * FROM assets.item'

async function getAllItems(req, res){
    try{
        const results = await pool.query(query)
        res.status(200).json(results.rows)
    }catch(error){
        console.log(error)
        res.status(404).send('An error occured')
    }
}

// Writing a fuction that counts to 100
async function countTo100(req, res){
    res.writeHead(200, {'content': 'text/html'})
    res.write("I have started the query")
    for (let i = 1; i <= 1000; i++){
        for (let j = 0; j < 1000; j++){
            console.log(`i is ${i} and j is ${j}`)
        }
    }
    res.end("Hopefully that didn't take too long")
}

module.exports = {
    countTo100,
    getAllItems
}