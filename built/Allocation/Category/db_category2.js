const addCategory = 'INSERT into Category (name, depreciationType, parentCategoryID) VALUES($1, $2, $3)';
const getCategoryID = 'SELECT ID FROM Category WHERE name = $1';
const addWrittenValueDepreciationEntry = 'INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)';
const updateCategoryName = "UPDATE Category SET name = $1 WHERE id = $2";
const updateFolderID = "UPDATE Category SET parentFolderID = $1 WHERE id = $2";
const updateDepreciationType = "UPDATE Category SET depreciationType = $1 WHERE id = $2";
const insertDepreciationPercent = "INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)";
const deleteDepreciationPerYear = "DELETE FROM DepreciationPerYear WHERE categoryID = $1";
const deleteDepreciationPercent = "DELETE FROM DepreciationPercent WHERE categoryID = $1";
const getCategoryDepreciationType = "SELECT depreciationType FROM Category WHERE ID = $1";
const getDepreciationPercent = "SELECT percentage FROM DepreciationPercent WHERE categoryID = $1";
const doesCategoryIDExist = "SELECT name FROM Category WHERE ID = $1";
const getAllCategories = 'SELECT name, ID FROM Category WHERE deleted = false';
const getCategory = `SELECT c.name, c.depreciationtype, f.name AS parentfolder FROM Category AS c JOIN Folder as f ON 
                    c.parentfolderid = f.id WHERE c.name=$1`;
const addChild = "INSERT INTO parentChildCategory (parentID, childID) VALUES ($1, $2)";
const getAllCategories2 = `
                        SELECT c.name AS category, c.id, c.depreciationtype, d.percentage, (SELECT name AS parent FROM Category WHERE id = c.parentCategoryID) 
                        FROM Category c FULL JOIN DepreciationPercent d ON d.categoryID = c.id WHERE c.deleted = false
`;
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
    getAllCategories,
    getCategory,
    addChild,
    getAllCategories2
};
export default categoryTable;
//# sourceMappingURL=db_category2.js.map