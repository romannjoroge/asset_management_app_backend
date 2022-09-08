const addCategory = 'INSERT into category (name, dep_type, num_dep, freq_dep) VALUES($1, $2, $3, $4)'
const removeCategory = 'DELETE FROM category WHERE category_id = $1'
const updateCategory = 'UPDATE category SET name = $1, dep_type = $2, num_dep = $3, freq_dep = $4 WHERE category_id = $5'
const getAllCategorys = 'SELECT name FROM category'
const getCategory = 'SELECT * FROM category WHERE category_id = $1'
const getCategoryFromName = 'SELECT category_id FROM category WHERE name = $1'

module.exports = {
    addCategory,
    removeCategory,
    updateCategory,
    getAllCategorys,
    getCategory,
    getCategoryFromName
}