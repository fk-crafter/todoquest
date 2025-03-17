import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions
    );

    console.log(`✅ MongoDB connectée : ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `❌ Erreur de connexion MongoDB : ${(error as Error).message}`
    );
    process.exit(1);
  }
};

export default connectDB;
