import { ASSETS, IASSETS } from "./collections.js";

export async function storeAssetDetails(args: IASSETS) {
    try {
        await ASSETS.insertOne(args);
    } catch(err) {
        console.log("Could Not Store Asset Details", err);
    }
}

//@ts-ignore
export async function getPriceOfAsset(embedding: number[]): Promise<number> {
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
        let cost: number;
        for await (let i of result) {
            cost = Number.parseFloat(i.cost);
            return cost;
        }
    } catch(err) {
        console.log("Error Getting Price of Asset", err);
        throw "Error Getting Price of Asset";
    }
}