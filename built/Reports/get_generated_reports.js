var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export function getGeneratedReports() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let query = "SELECT id, name FROM generatereports WHERE deleted = false";
            return yield getResultsFromDatabase(query, []);
        }
        catch (err) {
            throw new MyError(MyErrors2.NOT_GET_GENERATED_REPORTS);
        }
    });
}
//# sourceMappingURL=get_generated_reports.js.map