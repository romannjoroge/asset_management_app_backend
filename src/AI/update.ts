import pool from "../../db2.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import { getPriceOfAsset } from "./mongo/actions.js";
import { getEmbedding } from "./openai/embeddings.js";

async function updateInDatabase(assetID: number, description: string): Promise<void> {
    try {
        let embedding = await getEmbedding(description);
        let cost = await getPriceOfAsset(embedding);
        pool.query(
            "UPDATE Asset SET estimatedacquisitioncost = $1 WHERE assetID = $2",
            [cost, assetID]
        )
        console.log(`${assetID}: ${description} updated with ${cost}`)
    } catch (err) {
        console.log("Error Updating Asset", err);
        throw "Error Updating Asset";
    }
}

async function processOperationInBatches(operations: Promise<void>[], batchSize: number) {
    let start = 0;
    let numOperations = operations.length;

    async function processNextBatch() {
        if (start >= numOperations) {
            console.log('All operations completed');
            return;
        }

        const end = Math.min(start + batchSize, numOperations);
        const batch = operations.slice(start, end);

        try {
            await Promise.all(batch.map(async (operation) => {
                try {
                    await operation;
                    console.log(`Operation ${start} completed`);
                } catch (error) {
                    console.error(`Error in operation ${start}:`, error);
                }
                start++;
            }));

            console.log(`Batch completed. Processed ${end} out of ${numOperations} operations`);

            // Recursively call the next batch
            await processNextBatch();
        } catch(err) {
            console.error('Error processing batch:', err);
        }
    }

    await processNextBatch();
}


async function main() {
    try {
        // Keep track of whether to loop and the batch number
        let loop = true
        let batch = false


        let results = await getResultsFromDatabase<{ description: string, assetid: number }>(
            "SELECT assetID, description FROM Asset WHERE estimatedacquisitioncost = -1",
            []
        )

        let promises: Promise<void>[] = []
        for (let res of results) {
            promises.push(updateInDatabase(res.assetid, res.description))
        }

        processOperationInBatches(promises, 50);

    } catch (err) {
        console.log("Error Updating data", err);
    }
}
main();