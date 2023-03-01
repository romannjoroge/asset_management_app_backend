const addCategory = 'INSERT into Category (name, parentFolderID, depreciationType) VALUES($1, $2, $3)'
const getCategoryID = 'SELECT ID FROM Category WHERE name = $1'
const addWrittenValueDepreciationEntry = 'INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)'
const updateCategoryName = "UPDATE Category SET name = $1 WHERE id = $2";
const updateFolderID = "UPDATE Category SET parentFolderID = $1 WHERE id = $2";
const updateDepreciationType = "UPDATE Category SET depreciationType = $1 WHERE id = $2";
const insertDepreciationPercent = "INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)";
const deleteDepreciationPerYear = "DELETE FROM DepreciationPerYear WHERE categoryID = $1";
const deleteDepreciationPercent = "DELETE FROM DepreciationPercent WHERE categoryID = $1";
const getCategoryDepreciationType = "SELECT depreciationType FROM Category WHERE ID = $1";
const getDepreciationPercent = "SELECT percentage FROM DepreciationPercent WHERE categoryID = $1";
const doesCategoryIDExist = "SELECT name FROM Category WHERE ID = $1";
const getCategoryAssets = 'SELECT * FROM Asset WHERE categoryid = $1';
const getCategory = `SELECT Category.name, Folder.name AS parentfolder, Category.depreciationtype, DepreciationPercent.percentage AS depreciationpercentage 
                    FROM Category FULL JOIN DepreciationPercent ON Category.id = DepreciationPercent.categoryid 
                    FULL JOIN Folder ON Category.parentfolderid = Folder.id WHERE Category.id = $1`;

let categoryTable = {
    add: addCategory,
    getID: getCategoryID,
    addWritten: addWrittenValueDepreciationEntry,
    updateCategoryName: updateCategoryName,
    updateFolderID: updateFolderID,
    updateDepreciationType: updateDepreciationType,
    insertDepreciationPercent: insertDepreciationPercent,
    deleteDepreciationPerYear: deleteDepreciationPerYear,
    deleteDepreciationPercent: deleteDepreciationPercent,
    getCategoryDepreciationType: getCategoryDepreciationType,
    getDepreciationPercent: getDepreciationPercent,
    doesCategoryIDExist,
    getCategoryAssets,
    getCategory,
}

export default categoryTable;