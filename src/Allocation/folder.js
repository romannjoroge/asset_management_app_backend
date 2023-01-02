const folderTable = require('./db_folder');
const pool = require('../../db2');
const MyError = require('../../utility/myError');

class Folder {
    constructor (_name, _companyName) {
        this.name = _name;
        this.companyName = _companyName;
    }

    // Gets the name of a folder from an id
    static async getFolderNameFromId(id) {
        try {
            const result = await pool.query(folderTable.getFolderName, [id]);
            return result.rows[0].name;
        }catch(err){
            throw new MyError("Folder does not exist");
        }
    }
}

module.exports = Folder;