import client from "./client.js";

const DATABASE = client.db("KEMRI");

export interface IASSETS {
    embedding: number[],
    cost: string
}

export const ASSETS = DATABASE.collection<IASSETS>("assets")