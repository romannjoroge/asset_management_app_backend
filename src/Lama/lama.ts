import lmdb from "node-lmdb";
import _ from "lodash";
const { isNull } = _;

export class Lama {
  env: lmdb.Env
  dbi: lmdb.Dbi

  constructor(dbi: lmdb.Dbi, env: lmdb.Env) {
    this.dbi = dbi;
    this.env = env;
  }

  static async init(name: string) {
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
  }

  async put(key: string, value: string) {
    const txn = this.env.beginTxn()
    const bufferValue = Buffer.from(value)
    txn.putBinary(this.dbi, key, bufferValue)
    txn.commit()
  }

  async get(key: string) {
    const txn = this.env.beginTxn()
    const value = txn.getBinary(this.dbi, key)
    txn.commit()
    if (isNull(value)) {
      return null
    }
    return value.toString()
  }

  async close() {
    this.dbi.close()
    this.env.close()
  }

}