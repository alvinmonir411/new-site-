import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return { client: cachedClient!, db: cachedDb! };
  }

const client = new MongoClient(uri!);
await client.connect();

  const db = client.db(dbName);
  
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}