import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["AFTER_HOURS", "LONG_RUNNING_ROOM"],
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Devices",
        default: null
    },
    resolved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

alertSchema.index({ type: 1, room: 1, device: 1, resolved: 1 });

const Alerts = mongoose.model("Alerts", alertSchema)

export default Alerts