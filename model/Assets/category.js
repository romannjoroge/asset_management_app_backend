const addCategory = 'INSERT into Assets.category (name, dep_type, num_dep, freq_dep) VALUES($1, $2, $3, $4)'
const removeCategory = 'DELETE FROM Assets.category WHERE category_id = $1'
const updateCategory = 'UPDATE Assets.category SET name = $1, dep_type = $2, num_dep = $3, freq_dep = $4 WHERE category_id = $5'
const getAllCategorys = 'SELECT name FROM Assets.category'
const getCategory = 'SELECT * FROM Assets.category WHERE category_id = $1'

module.exports = {
    addCategory,
    removeCategory,
    updateCategory,
    getAllCategorys,
    getCategory
}