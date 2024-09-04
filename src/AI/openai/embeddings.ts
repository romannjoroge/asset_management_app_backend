import openai from "./client.js";

export async function getEmbedding(text: string): Promise<number[]> {
    try {
        let result = await openai.embeddings.create({input: text, model:"text-embedding-3-small"})
        return result.data[0].embedding;
    } catch(err) {
        console.log("Could Not Get Embedding of text", err);
        throw "Could Not Get Embedding of text";
    }
}