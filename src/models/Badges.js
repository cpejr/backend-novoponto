import mongoose from "mongoose";

const BadgesSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        url: {type: String, required: true},
    }
);

const BadgesModel = new mongoose.model("badges", BadgesSchema);

export default BadgesModel;