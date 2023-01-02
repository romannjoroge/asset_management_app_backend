const getFolderName = "SELECT name FROM Folder WHERE id = $1";

folderTable = {
    getFolderName: getFolderName
};

module.exports = folderTable;

