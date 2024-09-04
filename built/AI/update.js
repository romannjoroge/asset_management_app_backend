var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from "../../db2.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import { getPriceOfAsset } from "./mongo/actions.js";
import { getEmbedding } from "./openai/embeddings.js";
function updateInDatabase(assetID, description) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let embedding = yield getEmbedding(description);
            let cost = yield getPriceOfAsset(embedding);
            pool.query("UPDATE Asset SET estimatedacquisitioncost = $1 WHERE assetID = $2", [cost, assetID]);
            console.log(`${assetID}: ${description} updated with ${cost}`);
        }
        catch (err) {
            console.log("Error Updating Asset", err);
            throw "Error Updating Asset";
        }
    });
}
function processOperationInBatches(operations, batchSize) {
    return __awaiter(this, void 0, void 0, function* () {
        let start = 0;
        let numOperations = operations.length;
        function processNextBatch() {
            return __awaiter(this, void 0, void 0, function* () {
                if (start >= numOperations) {
                    console.log('All operations completed');
                    return;
                }
                const end = Math.min(start + batchSize, numOperations);
                const batch = operations.slice(start, end);
                try {
                    yield Promise.all(batch.map((operation) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield operation;
                            console.log(`Operation ${start} completed`);
                        }
                        catch (error) {
                            console.error(`Error in operation ${start}:`, error);
                        }
                        start++;
                    })));
                    console.log(`Batch completed. Processed ${end} out of ${numOperations} operations`);
                    // Recursively call the next batch
                    yield processNextBatch();
                }
                catch (err) {
                    console.error('Error processing batch:', err);
                }
            });
        }
        yield processNextBatch();
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Keep track of whether to loop and the batch number
            let loop = true;
            let batch = false;
            let results = yield getResultsFromDatabase("SELECT assetID, description FROM Asset WHERE estimatedacquisitioncost = -1", []);
            let promises = [];
            for (let res of results) {
                promises.push(updateInDatabase(res.assetid, res.description));
            }
            processOperationInBatches(promises, 50);
        }
        catch (err) {
            console.log("Error Updating data", err);
        }
    });
}
main();
//# sourceMappingURL=update.js.map