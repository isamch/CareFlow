import mongoose from "mongoose";


const connectDB = async () => {

  try {

    await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

  } catch (error) {
    console.log("error db conection : " + error);
    process.exit(1);
  }

};


export default connectDB;