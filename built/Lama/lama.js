var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import lmdb from "node-lmdb";
import _ from "lodash";
const { isNull } = _;
export class Lama {
    constructor(dbi, env) {
        this.dbi = dbi;
        this.env = env;
    }
    static init(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const env = new lmdb.Env();
            env.open({
                path: './store/lama',
                maxDbs: 10,
                mapSize: 4 * 1024 * 1024 * 1024
            });
            const dbi = env.openDbi({
                name,
                create: true
            });
            return new Lama(dbi, env);
        });
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const txn = this.env.beginTxn();
            const bufferValue = Buffer.from(value);
            txn.putBinary(this.dbi, key, bufferValue);
            txn.commit();
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const txn = this.env.beginTxn();
            const value = txn.getBinary(this.dbi, key);
            txn.commit();
            if (isNull(value)) {
                return null;
            }
            return value.toString();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dbi.close();
            this.env.close();
        });
    }
}
//# sourceMappingURL=lama.js.map