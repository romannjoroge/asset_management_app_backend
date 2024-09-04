import { storeAssetDetails } from "./mongo/actions.js";
import { getEmbedding } from "./openai/embeddings.js";
import fs from "fs";
import csv from "csv-parser";
let promises = [];
function storeDataEmbedding(data) {
    return new Promise((res, rej) => {
        getEmbedding(data['Description']).then((embedding) => {
            storeAssetDetails({ embedding, cost: data['Cost'] }).then((_) => {
                return res();
            });
        }).catch((err) => {
            console.log("Could Not Get Embedding of ", data);
        });
    });
}
function loadData(filePath) {
    return new Promise((res, rej) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
            promises.push(storeDataEmbedding(data));
        })
            .on('end', () => {
            console.log("Updates done");
            return res();
        });
    });
}
function main() {
    loadData('all_items.csv').then((_) => {
        console.log("Done loading data");
    }).catch((err) => {
        console.log("Error Loading data", err);
    });
}
main();
//# sourceMappingURL=load_db.js.map