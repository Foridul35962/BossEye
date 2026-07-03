import mongoose from "mongoose"

const deviceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    room:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true,
        enum: ["fan", "light"]
    },
    status:{
        type: Boolean,
        required: true,
        default: false
    },
    watt:{
        type: Number,
        required: true,
    },
    lastChanged:{
        type:Date
    },
    runningSince:{
        type:Date
    }
}, {timestamps: true})

const Devices = mongoose.model("Devices", deviceSchema)

export default Devices