"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_folder_js_1 = __importDefault(require("./db_folder.js"));
const db2_js_1 = __importDefault(require("../../../db2.js"));
const myError_js_1 = __importDefault(require("../../utility/myError.js"));
class Folder {
    constructor(_name, _companyName) {
        this.name = _name;
        this.companyName = _companyName;
    }
    // Gets the name of a folder from an id
    static doesFolderExist(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db2_js_1.default.query(db_folder_js_1.default.getFolderName, [id]);
                if (result.rowCount === 0) {
                    return false;
                }
                else {
                    return true;
                }
            }
            catch (err) {
                return false;
            }
        });
    }
}
exports.default = Folder;
