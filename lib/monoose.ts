import mongoose, { Mongoose } from "mongoose";


const MONGO_URI = process.env.MONGO_URIa as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defineds");
}
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose>  => {
  if (cached.conn) {
    return cached.conn;
  }
  if(!cached.promise){
      cached.promise = mongoose.connect(MONGO_URI,{
        dbName: "devflow",
      }).then((result) => {
        console.log("Connected to MongoDB");
        return result;
      }).catch((error: Error) => {
        console.error("Error connecting to MongoDB:", error);
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
