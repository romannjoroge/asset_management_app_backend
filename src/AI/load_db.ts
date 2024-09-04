import { storeAssetDetails } from "./mongo/actions.js"
import { getEmbedding } from "./openai/embeddings.js"
import fs from "fs";
import csv from "csv-parser";

let promises: Promise<void>[] = [];

function storeDataEmbedding(data: Record<string, any>): Promise<void> {
    return new Promise((res, rej) => {
        getEmbedding(data['Description']).then((embedding) => {
            storeAssetDetails({ embedding, cost: data['Cost'] }).then((_: any) => {
                return res();
            })
        }).catch((err) => {
            console.log("Could Not Get Embedding of ", data);
        })
    })
}

function loadData(filePath: string): Promise<void> {
    return new Promise((res, rej) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                promises.push(storeDataEmbedding(data))
            })
            .on('end', () => {
                console.log("Updates done");
                return res();
            });
    })
}

function main() {
    loadData('all_items.csv').then((_: any) => {
        console.log("Done loading data");
    }).catch((err: any) => {
        console.log("Error Loading data", err);
    })
}

main();