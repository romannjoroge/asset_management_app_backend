import {MongoClient, ServerApiVersion} from "mongodb";
import "dotenv/config"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_CON_STRING!);
export default client;