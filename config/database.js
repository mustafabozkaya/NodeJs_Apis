const mongoose = require("mongoose");
require("dotenv").config(); // This is needed to read the .env file

mongoose.set("strictQuery", false); // This is needed to allow the use of the $or operator


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
