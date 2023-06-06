"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFolderName = "SELECT name FROM Folder WHERE id = $1";
let folderTable = {
    getFolderName: getFolderName
};
exports.default = folderTable;
