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
// Importing the database bool from db2.js. This will allow me to connect to the database
const db2_js_1 = __importDefault(require("../../db2.js"));
// Importing custom classes
const myError_js_1 = __importDefault(require("../utility/myError.js"));
const folder_js_1 = __importDefault(require("../Allocation/Folder/folder.js"));
const utility_js_1 = __importDefault(require("../utility/utility.js"));
const db_location_js_1 = __importDefault(require("./db_location.js"));
class Location {
    constructor() { }
    static verifyLocationID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Returns true if locationID exists in the database, false otherwise
            let fetchResult;
            try {
                fetchResult = yield db2_js_1.default.query(db_location_js_1.default.getLocation, [id]);
            }
            catch (err) {
                throw new myError_js_1.default(message);
            }
            return (fetchResult.rowCount > 0);
        });
    }
}
exports.default = Location;
