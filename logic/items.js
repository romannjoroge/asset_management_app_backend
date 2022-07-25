const queries = require('../model/Assets/items')
const utility = require('../utility/utility')
const {getCategory} = require('../model/Assets/category')

const pool = require("../db");
const { parse } = require('dotenv');

function addItem(req, res){
    // Getting item param from request body
    let {
        category_id,
        name, 
        purchase_date, 
        purchase_amount, 
        next_dep_date, 
        accum_dep, 
        isnew
    } = req.body;

    // Conveting purchase_date and purchase_amount, accum_dep into floats
    purchase_amount = parseFloat(purchase_amount)
    accum_dep = parseFloat(accum_dep)

    // Converting category id into an int
    category_id = parseInt(category_id)

    // Check if category exists
    pool.query(getCategory, [category_id], (error, result)=>{
        if (error) throw error
        if (!result.rows.length){
            res.status(404).json({'code':404, 'message':'Category provided does not exist'})
        }
    })

    // Putting variables in list to pass to isAnyEmpty
    const list = [category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew]

    // Check if any are empty
    if (!utility.isAnyEmpty(list)){
        // Results are not empty so you can add them to database
        pool.query(queries.addItem, [category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew], 
            (error, result)=>{
                if (error) throw error
                console.log('The code reaches me')
                res.status(201).json({'success': true, 'message': 'Item added succesfuly'})
                res.end()
            })
    }
    
    // One of the results are empty
    res.status(404).json({'code': 404, 'message':'One of the parameters has no value'})
}

function removeItem(req, res){
    // Add code
}

function updateItem(req, res){
    // Add code
}

function getItem(req, res){
    // Add code
}

function getItems(req, res){
    // Add code
}

module.exports = {
    addItem,
    removeItem,
    updateItem,
    getItem,
    getItems
}