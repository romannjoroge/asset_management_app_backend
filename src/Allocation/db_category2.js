const addCategory = 'INSERT into Category (name, parentFolderID, depreciationType) VALUES($1, $2, $3)'
const getCategoryID = 'SELECT ID FROM Category WHERE name = $1'
const addStraightLineDepreciationEntry = 'INSERT INTO DepreciationPerYear (categoryID, value) VALUES ($1, $2)'
const addWrittenValueDepreciationEntry = 'INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)'
const updateCategoryName = "UPDATE Category SET name = $1 WHERE id = $2";
const updateFolderID = "UPDATE Category SET parentFolderID = $1 WHERE id = $2";
const updateDepreciationType = "UPDATE Category SET depreciationType = $1 WHERE id = $2";
const updateDepreciationPerYear = "UPDATE DepreciationPerYear SET categoryID = $1, value = $2 WHERE categoryID = $1";

let categoryTable = {
    add: addCategory,
    getID: getCategoryID,
    addStraight: addStraightLineDepreciationEntry,
    addWritten: addWrittenValueDepreciationEntry,
    updateCategoryName: updateCategoryName,
    updateFolderID: updateFolderID,
    updateDepreciationType: updateDepreciationType,
    updateDepreciationPerYear: updateDepreciationPerYear,
}

module.exports = categoryTable;