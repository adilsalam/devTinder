const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connection successful");
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = connectDB;
