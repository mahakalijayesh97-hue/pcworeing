import { MongoClient } from "mongodb";

// Safety fallback for build time
const uri = process.env.DATABASE_URL || "mongodb+srv://jayesh:jayesh%40123@cluster0.9usafbn.mongodb.net/pc_db?retryWrites=true&w=majority&appName=Cluster0";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

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
  
  // CRITICAL: Do not connect during Vercel build phase if URI is invalid
  if (process.env.NEXT_PHASE === "phase-production-build" || !process.env.DATABASE_URL) {
    console.log("Skipping real MongoDB connection during build...");
    clientPromise = Promise.resolve(client);
  } else {
    clientPromise = client.connect();
  }
}

export default clientPromise;