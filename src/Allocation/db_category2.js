const addCategory = 'INSERT into Category (name, parentFolderID, depreciationType) VALUES($1, $2, $3)'
const getCategoryID = 'SELECT ID FROM Category WHERE name = $1'
const addStraightLineDepreciationEntry = 'INSERT INTO DepreciationPerYear (categoryID, value) VALUES ($1, $2)'
const addWrittenValueDepreciationEntry = 'INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)'

let categoryTable = {
    add: addCategory,
    getID: getCategoryID,
    addStraight: addStraightLineDepreciationEntry,
    addWritten: addWrittenValueDepreciationEntry
}

export default categoryTable