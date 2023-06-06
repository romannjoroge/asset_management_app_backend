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
const utility_js_1 = __importDefault(require("../utility/utility.js"));
const db_users_js_1 = __importDefault(require("./db_users.js"));
class User {
    constructor() { }
    static checkIfUserExists(username, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fetchResults = yield db2_js_1.default.query(db_users_js_1.default.checkIfUserInDB, [username]);
                utility_js_1.default.verifyDatabaseFetchResults(fetchResults, errorMessage);
            }
            catch (err) {
                throw new myError_js_1.default(errorMessage);
            }
        });
    }
}
exports.default = User;
