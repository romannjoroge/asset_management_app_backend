const folderTable = require('./db_folder');
const pool = require('../../db2');
const MyError = require('../../utility/myError');

class Folder {
    constructor (_name, _companyName) {
        this.name = _name;
        this.companyName = _companyName;
    }

    // Gets the name of a folder from an id
    static async doesFolderExist(id) {
        try {
            const result = await pool.query(folderTable.getFolderName, [id]);
            if (result.rowCount === 0){
                return false;
            }else{
                return true;
            }
        }catch(err){
            return false;
        }
    }
}

module.exports = Folder;