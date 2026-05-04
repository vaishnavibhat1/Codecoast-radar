import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    // Start in-memory MongoDB server for development
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected (In-Memory): ${conn.connection.host}`);
    console.log(`📦 Database URI: ${mongoUri}`);
    
    // Create indexes for geospatial queries
    mongoose.connection.db.collection('jobs').createIndex({ location: '2dsphere' });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
export { mongoServer };
