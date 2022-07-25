// Writing a fuction that counts to 100
function countTo100(req, res){
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
    countTo100
}