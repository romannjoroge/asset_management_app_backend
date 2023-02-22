const getFolderName = "SELECT name FROM Folder WHERE id = $1";

let folderTable = {
    getFolderName: getFolderName
};

export default folderTable;

