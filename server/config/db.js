import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/KwikKartDB';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
