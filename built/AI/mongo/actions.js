var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { ASSETS } from "./collections.js";
export function storeAssetDetails(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ASSETS.insertOne(args);
        }
        catch (err) {
            console.log("Could Not Store Asset Details", err);
        }
    });
}
//@ts-ignore
export function getPriceOfAsset(embedding) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const agg = [
                {
                    '$vectorSearch': {
                        'index': 'vector_index',
                        'path': 'embedding',
                        'queryVector': embedding,
                        'numCandidates': 150,
                        'limit': 1
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'cost': 1,
                    }
                }
            ];
            // run pipeline
            const result = ASSETS.aggregate(agg);
            let cost;
            try {
                for (var _d = true, result_1 = __asyncValues(result), result_1_1; result_1_1 = yield result_1.next(), _a = result_1_1.done, !_a; _d = true) {
                    _c = result_1_1.value;
                    _d = false;
                    let i = _c;
                    cost = Number.parseFloat(i.cost);
                    return cost;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = result_1.return)) yield _b.call(result_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (err) {
            console.log("Error Getting Price of Asset", err);
            throw "Error Getting Price of Asset";
        }
    });
}
//# sourceMappingURL=actions.js.map