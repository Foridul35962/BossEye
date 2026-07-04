import mongoose from "mongoose";

const powerHistorySchema = new mongoose.Schema({
    time: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    totalPower: {
        type: Number,
        required: true
    },
    perRoom: {
        type: Map,
        of: Number, // room name -> Watts
        default: {},
    }
}, { timestamps: true })

const PowerHistory = mongoose.model("PowerHistory", powerHistorySchema)

export default PowerHistory