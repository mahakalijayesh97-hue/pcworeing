import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/pc_db";
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set");
}

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);

  if (process.env.NEXT_PHASE === "phase-production-build") {
    clientPromise = Promise.resolve(client);
  } else {
    clientPromise = client.connect();
  }
}

export default clientPromise;