const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("MongoDb connected");

    } catch (error) {
        console.error("DB connection failed", error);
        process.exit(1);
    }
};

module.exports = connectDB; 