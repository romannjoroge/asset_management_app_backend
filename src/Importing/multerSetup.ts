import multer from "multer";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";

// Set up multer: Specify directory to store files and give a function for creating file names
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(new MyError(MyErrors2.NOT_STORE_FILE), '../../attachments');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(new MyError(MyErrors2.NOT_STORE_FILE), file.fieldname + '-' + uniqueSuffix);
    }
})

export default storage;