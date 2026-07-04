import mongoose from "mongoose";
import Devices from "../model/Devices.model.js";
import deviceData from "../db/devices.json" assert { type: "json" };
import PowerHistory from "../model/PowerHistory.model.js";
import Alerts from "../model/Alert.model.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/bosseye`);
        console.log("Database connected");

        // PowerHistory.deleteMany()
        // Alerts.deleteMany()

        const count = await Devices.countDocuments();

        if (count === 0) {
            await Devices.insertMany(deviceData);
            console.log("Devices seeded into database");
        }

    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
};

export default connectDB;